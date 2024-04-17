import type { NodeValidator } from '../../lib/getNodeValidator';
import { getNodeValidator } from '../../lib/getNodeValidator';
import type { IMatcher, MatchModel, MatchProps } from '../Matcher.interface';

export interface BaseMatcherProps {
  validDomExclusions?: any[];
  validDomInclusions?: any[];
}

export abstract class BaseMatcher implements IMatcher {
  private _nodeValidator: NodeValidator;

  constructor(protected _props: BaseMatcherProps = {}) {
    this._nodeValidator = getNodeValidator(
      this._props.validDomExclusions,
      this._props.validDomInclusions,
    );
  }

  isValidNode = (node: Node) => {
    return this._nodeValidator(node);
  };

  isValidParentNode = (node: Node) => {
    while (node && node.parentNode && node.parentNode !== document) {
      if (!this.isValidNode(node.parentNode)) {
        return false;
      }
      node = node.parentNode;
    }
    return true;
  };

  protected abstract _matchCore(props: MatchProps): MatchModel[];

  match = (props: MatchProps) => {
    const { validate, node } = props;
    if (!validate || (this.isValidNode(node) && this.isValidParentNode(node))) {
      return this._matchCore(props);
    }
  };
}
