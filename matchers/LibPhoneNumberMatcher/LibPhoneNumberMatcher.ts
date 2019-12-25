import { detect } from '@ringcentral-integration/phone-number';
import { BaseMatcherProps, BaseMatcher } from '../BaseMatcher';
import { MatchModel } from '../Matcher.interface';

import {
  processNode,
  isAnchorNode,
  isValueNode,
  isC2dNumberNode,
} from './processNode';

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
}

export class LibPhoneNumberMatcher extends BaseMatcher {
  constructor(protected _props: LibPhoneMatcherProps = {}) {
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

  protected _matchCore({ node, children = true }): MatchModel[] {
    const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ALL, {
      acceptNode: (node: Node): number => {
        return acceptNode(node)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });
    let matches: MatchModel[] = [];
    let current = treeWalker.currentNode;
    if (acceptNode(current)) {
      while (current) {
        const newMatches = processNode(current, this._detect);
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
