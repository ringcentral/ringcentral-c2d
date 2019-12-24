import { Emitter } from '../../lib/Emitter';
import { C2DEvents } from '../../lib/C2DEvents';
import { IMatcher } from '../../matchers/Matcher.interface';
import { MatchProps, IMatchObject } from './interfaces';
import { IObserver, ObserverProps } from '../Observer.interface';
import { MatchObserver } from './MatchObserver';
import { LibPhoneNumberMatcher } from '../../matchers/LibPhoneNumberMatcher';

export interface RangeObserverProps extends ObserverProps {}

export class RangeObserver extends Emitter implements IObserver {
  private _matcher: IMatcher;
  private _innerObserver: MatchObserver;

  constructor({
    node = document.body,
    observerOptions,
    matcher = new LibPhoneNumberMatcher(),
  }: RangeObserverProps = {}) {
    super();

    this._matcher = matcher;

    this._innerObserver = new MatchObserver({
      observerOptions,
      matcher: this._matchFunc,
      onHoverIn: this._onHoverIn,
      onHoverOut: this._onHoverOut,
    });

    this._innerObserver.observe(node);
  }

  private _matchFunc = (node: Node, children: boolean): MatchProps[] => {
    const models = this._matcher.match({
      node,
      children,
      validate: true,
    });
    if (!models) {
      return null;
    }
    const matches = models.map<MatchProps>((item) => {
      return {
        startsNode: item.startsNode,
        startsAt: item.startsAt,
        endsNode: item.endsNode,
        endsAt: item.endsAt,
        context: item.context,
      };
    });
    return matches;
  };

  private _onHoverIn = (target: Element, match: IMatchObject) => {
    if (!this.disposed) {
      this._emitter.emit(C2DEvents.hoverIn, {
        target,
        rect: match.rect,
        context: match.context,
      });
    }
  };

  private _onHoverOut = (target: Element) => {
    if (!this.disposed) {
      this._emitter.emit(C2DEvents.hoverOut, { target });
    }
  };

  dispose() {
    if (this._innerObserver) {
      this._innerObserver.disconnect();
      this._innerObserver = null;
    }
    super.dispose();
  }
}
