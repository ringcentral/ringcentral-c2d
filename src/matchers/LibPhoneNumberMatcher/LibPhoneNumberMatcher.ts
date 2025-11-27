import { detect } from '@ringcentral-integration/phone-number';

import { isValueNode } from '../../lib/NodeObserver/utilities';
import { BaseMatcher, type BaseMatcherProps } from '../BaseMatcher';
import type { MatchModel } from '../Matcher.interface';

import { isAnchorNode, isC2dNumberNode, processNode } from './processNode';

export function acceptNode(node: Node): boolean {
  return !(
    node.parentElement &&
    (isAnchorNode(node.parentElement) ||
      isValueNode(node.parentElement) ||
      isC2dNumberNode(node.parentElement))
  );
}
export interface LibPhoneMatcherProps extends BaseMatcherProps {
  countryCode?: string;
  areaCode?: string;
  processNode?: (
    current: Node,
    detectFunc: (value: string) => any[],
  ) => MatchModel[];
  includeFormElements?: boolean;
}

export class LibPhoneNumberMatcher extends BaseMatcher {
  constructor(protected override _props: LibPhoneMatcherProps = {}) {
    super(_props);
  }

  private _detect = (value: string) => {
    const phones = detect({
      input: value,
      countryCode: this._props.countryCode,
      areaCode: this._props.areaCode,
    });
    return phones;
  };

  protected _matchCore({
    node,
    children = true,
  }: {
    node: Node;
    children?: boolean;
  }): MatchModel[] {
    const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ALL, {
      acceptNode: (node: Node): number => {
        return acceptNode(node)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });
    let matches: MatchModel[] = [];
    let current: Node | null = treeWalker.currentNode;
    if (acceptNode(current)) {
      while (current) {
        const newMatches = this._props.processNode
          ? this._props.processNode(current, this._detect)
          : processNode(current, this._detect, this._props.includeFormElements);
        if (newMatches && newMatches.length) {
          matches = matches.concat(newMatches);
        }
        if (!children) {
          break;
        }
        current = treeWalker.nextNode();
      }
    }
    return matches;
  }
}
