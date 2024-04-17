import type { Emitter } from '../lib/Emitter';
import type { MatchRect } from '../lib/NodeObserver';
import type { MatchContextModel } from '../matchers';

export interface TargetItem {
  target: Element;
  rect: MatchRect;
  context?: MatchContextModel;
}

export interface IWidget extends Emitter {
  setTarget: (item?: TargetItem) => void;
}
