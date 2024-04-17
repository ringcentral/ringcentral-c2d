import type { Emitter } from '../lib/Emitter';
import type { MatchRect } from '../lib/NodeObserver';
import type { IMatcher, MatchContextModel } from '../matchers';

export interface ObserverProps {
  node?: Node;
  matcher?: IMatcher;
  observerOptions?: MutationObserverInit;
}

export interface ObserverEventArg {
  target: Element;
  rect: MatchRect;
  context?: MatchContextModel;
}

export interface IObserver extends Emitter {
  dispose(): void;
  disposed: boolean;
}
