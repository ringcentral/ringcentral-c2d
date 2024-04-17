import { BaseMatcher } from '../BaseMatcher';
import type { MatchModel } from '../Matcher.interface';

import { traverseNode } from './traverseNode';

export class RegExpPhoneNumberMatcher extends BaseMatcher {
  protected _matchCore({ node }: { node: Node }): MatchModel[] {
    return Array.from(
      [node].reduce(traverseNode, {
        isValidNode: this.isValidNode,
        result: new Set<MatchModel>(),
      }).result,
    );
  }
}
