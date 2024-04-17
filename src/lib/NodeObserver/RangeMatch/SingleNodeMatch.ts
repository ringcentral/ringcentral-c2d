import { RangeMatch } from './RangeMatch';

export class SingleNodeMatch extends RangeMatch {
  constructor(private _node: Node) {
    super();
  }

  override get startsNode() {
    return this._node;
  }

  override get endsNode() {
    return this._node;
  }

  override get startsAt() {
    return undefined;
  }

  override get endsAt() {
    return undefined;
  }
}
