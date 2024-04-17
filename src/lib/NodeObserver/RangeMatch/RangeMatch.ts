import { Emitter } from '../../Emitter';
import { isTextNode, isValueNode, upClosestElement } from '../utilities';

import type { IRangeMatch, MatchRect } from './RangeMatch.interface';

function searchDescendant(node: Node, getFirst: boolean) {
  let current: Node | null = node;
  while (current && current.childNodes.length) {
    current = getFirst ? current.firstChild : current.lastChild;
    // skip whitespace or empty text node, it has nothing to select
    while (current && isTextNode(current) && !current.textContent!.trim()) {
      const sibling = getFirst ? current.nextSibling : current.previousSibling;
      if (sibling) {
        current = sibling;
      } else {
        break;
      }
    }
  }
  return current;
}

function searchTextOffset(node: Node, getFirst: boolean) {
  if (!isTextNode(node) || node.textContent === null) {
    return null;
  }
  const reg = getFirst ? /^\s+/ : /\s+$/;
  const text = node.textContent.replace(reg, '');
  const offset = getFirst ? node.textContent.length - text.length : text.length;
  return offset;
}

export abstract class RangeMatch extends Emitter implements IRangeMatch {
  private _container?: Element | null;
  private _rect?: MatchRect;

  abstract get startsNode(): Node;
  abstract get endsNode(): Node;

  // for text node only
  abstract get startsAt(): number | undefined;
  abstract get endsAt(): number | undefined;

  involves(node: Node) {
    return this.startsNode === node || this.endsNode === node;
  }

  getRect() {
    if (!this._rect) {
      this.buildRect();
    }
    return this._rect!;
  }

  getAncestorContainer() {
    // should cache ancestor container reference
    // we can't get the correct ancestor container when the startsNode or the endsNode is removed
    if (!this._container) {
      let node: Node;
      if (this.startsNode === this.endsNode) {
        node = this.startsNode;
      } else {
        const range = this.createRange();
        node = range.commonAncestorContainer;
        range.detach(); // Releases the Range from use to improve performance.
      }
      this._container = upClosestElement(node) ?? undefined;
    }
    return this._container;
  }

  private createRange() {
    const range = document.createRange();

    if (isTextNode(this.startsNode) && Number.isInteger(this.startsAt)) {
      range.setStart(this.startsNode, this.startsAt!);
    } else if (isValueNode(this.startsNode)) {
      range.setStartBefore(this.startsNode);
    } else {
      const hitStartsNode =
        searchDescendant(this.startsNode, true) ?? this.startsNode;
      const hitStartsAt = searchTextOffset(hitStartsNode, true);
      if (hitStartsAt !== null && Number.isInteger(hitStartsAt)) {
        range.setStart(hitStartsNode, hitStartsAt);
      } else {
        range.setStartBefore(hitStartsNode);
      }
    }

    if (isTextNode(this.endsNode) && Number.isInteger(this.endsAt)) {
      range.setEnd(this.endsNode, this.endsAt!);
    } else if (isValueNode(this.endsNode)) {
      range.setEndAfter(this.endsNode);
    } else {
      const hitEndsNode =
        searchDescendant(this.endsNode, false) ?? this.endsNode;
      const hitEndsAt = searchTextOffset(hitEndsNode, false);
      if (hitEndsAt !== null && Number.isInteger(hitEndsAt)) {
        range.setEnd(hitEndsNode, hitEndsAt);
      } else {
        range.setEndAfter(hitEndsNode);
      }
    }

    return range;
  }

  protected buildRect() {
    const range = this.createRange();
    const rangeCopy = range.cloneRange();

    const rect = range.getBoundingClientRect();

    range.collapse(true);
    const startRect = range.getBoundingClientRect();

    rangeCopy.collapse(false);
    const endRect = range.getBoundingClientRect();

    // releases the Range from use to improve performance.
    range.detach();
    rangeCopy.detach();

    this._rect = {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      startLineHeight: startRect.height,
      endLineHeight: endRect.height,
    };
  }

  protected isMatch(x: number, y: number) {
    if (!this._rect) {
      this.buildRect();
    }
    return (
      !!this._rect &&
      this._rect.left <= x &&
      x <= this._rect.right &&
      this._rect.top <= y &&
      y <= this._rect.bottom
    );
  }
}
