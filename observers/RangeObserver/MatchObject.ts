import { MatchProps, MatchRect, IMatchObject } from './interfaces';
import { isTextNode, isValueNode, upClosestElement } from './utilities';

function searchDescendant(node: Node, getFirst: boolean): Node {
  let current: Node = node;
  while (current.childNodes.length) {
    current = getFirst ? current.firstChild : current.lastChild;
    // skip whitespace or empty text node, it has nothing to select
    while (isTextNode(current) && !current.textContent.trim()) {
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

function searchTextOffset(node: Node, getFirst: boolean): number {
  if (!isTextNode(node)) {
    return null;
  }
  const reg = getFirst ? /^\s+/ : /\s+$/;
  const text = node.textContent.replace(reg, '');
  const offset = getFirst ? node.textContent.length - text.length : text.length;
  return offset;
}

export class MatchObject implements IMatchObject {
  private _container: Element;
  private _rect: MatchRect;

  constructor(private _props: MatchProps) {
    if (!this._props.startsNode) {
      throw new Error('[startsNode] is required');
    }
    if (!this._props.endsNode) {
      throw new Error('[endsNode] is required');
    }
  }

  createRange(): Range {
    const range = document.createRange();

    if (isTextNode(this.startsNode) && Number.isInteger(this.startsAt)) {
      range.setStart(this.startsNode, this.startsAt);
    } else if (isValueNode(this.startsNode)) {
      range.setStartBefore(this.startsNode);
    } else {
      const hitStartsNode = searchDescendant(this.startsNode, true);
      const hitStartsAt = searchTextOffset(hitStartsNode, true);
      if (Number.isInteger(hitStartsAt)) {
        range.setStart(hitStartsNode, hitStartsAt);
      } else {
        range.setStartBefore(hitStartsNode);
      }
    }

    if (isTextNode(this.endsNode) && Number.isInteger(this.endsAt)) {
      range.setEnd(this.endsNode, this.endsAt);
    } else if (isValueNode(this.endsNode)) {
      range.setEndAfter(this.endsNode);
    } else {
      const hitEndsNode = searchDescendant(this.endsNode, false);
      const hitEndsAt = searchTextOffset(hitEndsNode, false);
      if (Number.isInteger(hitEndsAt)) {
        range.setEnd(hitEndsNode, hitEndsAt);
      } else {
        range.setEndAfter(hitEndsNode);
      }
    }

    return range;
  }

  getAncestorContainer(): Element {
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
      this._container = upClosestElement(node);
    }
    return this._container;
  }

  buildRect() {
    const range = this.createRange();
    const rangeCopy = range.cloneRange();

    const rect = range.getBoundingClientRect();

    range.collapse(true);
    const startRect = range.getBoundingClientRect();

    rangeCopy.collapse(false);
    const endRect = range.getBoundingClientRect();

    // Releases the Range from use to improve performance.
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

  isMatch(x: number, y: number): boolean {
    return (
      this.rect &&
      this.rect.left <= x &&
      x <= this.rect.right &&
      this.rect.top <= y &&
      y <= this.rect.bottom
    );
  }

  contains(node: Node): boolean {
    return this.startsNode === node || this.endsNode === node;
  }

  get startsNode(): Node {
    return this._props.startsNode;
  }

  get startsAt(): number {
    return this._props.startsAt;
  }

  get endsNode(): Node {
    return this._props.endsNode;
  }

  get endsAt(): number {
    return this._props.endsAt;
  }

  get rect(): MatchRect {
    return this._rect;
  }

  get context(): any {
    return this._props.context;
  }
}
