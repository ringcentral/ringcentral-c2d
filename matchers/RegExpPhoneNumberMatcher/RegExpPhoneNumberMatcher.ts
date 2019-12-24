import { reduce } from 'ramda';
import { BaseMatcher } from '../BaseMatcher';
import { MatchModel } from '../Matcher.interface';
import { traverseNode } from './traverseNode';

export class RegExpPhoneNumberMatcher extends BaseMatcher {
  protected _matchCore({ node }): MatchModel[] {
    return Array.from(
      reduce(
        traverseNode,
        {
          isValidNode: this.isValidNode,
          result: new Set<MatchModel>(),
        },
        [node],
      ).result,
    );
  }
}
