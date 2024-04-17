import { RangeMatch } from './RangeMatch';

export interface StartToEndMatchProps {
  startsNode: Node;
  endsNode: Node;
  startsAt?: number;
  endsAt?: number;
}

export class StartToEndMatch extends RangeMatch {
  constructor(private _props: StartToEndMatchProps) {
    super();
  }

  override get startsNode() {
    return this._props.startsNode;
  }

  override get endsNode() {
    return this._props.endsNode;
  }

  override get startsAt() {
    return this._props.startsAt;
  }

  override get endsAt() {
    return this._props.endsAt;
  }
}
