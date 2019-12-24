import { Emitter } from '../lib/Emitter';
import { IMatcher } from '../matchers/Matcher.interface';

export interface ObserverProps {
  node?: Node;
  matcher?: IMatcher;
  observerOptions?: MutationObserverInit;
}

export interface IObserver extends Emitter {
  dispose(): void;
  disposed: boolean;
}
