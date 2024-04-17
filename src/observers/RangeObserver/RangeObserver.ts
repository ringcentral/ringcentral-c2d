import { Emitter } from '../../lib/Emitter';
import {
  DefaultNodeObserver,
  HoverRangeMatch,
  type IRangeMatch,
} from '../../lib/NodeObserver';
import {
  DefaultProducer,
  DefaultQueue,
  DelayedConsumer,
  type Consumer,
  type Queue,
} from '../../lib/Queue';
import { LibPhoneNumberMatcher, type MatchContextModel } from '../../matchers';
import type {
  IObserver,
  ObserverEventArg,
  ObserverProps,
} from '../Observer.interface';
import { ObserverEvents } from '../ObserverEvents';

const DEFAULT_OBSERVER_OPTIONS: MutationObserverInit = {
  attributeFilter: ['href'],
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
};

export interface RangeObserverProps extends ObserverProps {}

export class RangeObserver extends Emitter implements IObserver {
  private _props: RangeObserverProps;
  private _observer?: DefaultNodeObserver;
  private _nodeQueue: Queue<Node>;
  private _nodeConsumer: Consumer<Node>;

  constructor(props?: RangeObserverProps) {
    super();

    this._props = {
      ...props,
      node: props?.node ?? document.body,
      matcher: props?.matcher ?? new LibPhoneNumberMatcher(),
      observerOptions: props?.observerOptions ?? DEFAULT_OBSERVER_OPTIONS,
    };

    this._nodeQueue = new DefaultQueue<Node>();
    const nodeProducer = new DefaultProducer(this._nodeQueue);
    this._nodeConsumer = new DelayedConsumer({
      queue: this._nodeQueue,
      maxConsumption: 100,
      onConsume: () => {
        this._nodeConsumer.current.forEach(({ message: node }) => {
          // https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected
          if (node && node.isConnected) {
            this._matchFunc(node);
          }
        });
      },
    });

    this._observer = new DefaultNodeObserver({
      observerOptions: this._props.observerOptions,
      matcher: (node: Node) => {
        nodeProducer.send(node);
        this._nodeConsumer.trigger();
        return undefined;
      },
    });

    this._observer.observe(this._props.node!);
  }

  private _matchFunc = (node: Node): IRangeMatch[] | undefined => {
    const models = this._props.matcher!.match({
      node,
      validate: true,
    });
    if (!models) {
      return;
    }
    models.forEach((item) => {
      const match = new HoverRangeMatch<MatchContextModel>({
        startsNode: item.startsNode,
        startsAt: item.startsAt,
        endsNode: item.endsNode,
        endsAt: item.endsAt,
        dataContext: item.context,
      });
      match.on(match.events.click, this._onClick);
      match.on(match.events.hoverIn, this._onHoverIn);
      match.on(match.events.hoverOut, this._onHoverOut);
      this._observer?.addMatch(match);
    });
  };

  private _onClick = (
    match: HoverRangeMatch<MatchContextModel>,
    event: Event,
  ) => {
    if (!this.disposed) {
      this.emit(ObserverEvents.click, {
        target: event.currentTarget as Element,
        rect: match.getRect(),
        context: match.dataContext,
      } satisfies ObserverEventArg);
    }
  };

  private _onHoverIn = (
    match: HoverRangeMatch<MatchContextModel>,
    event: Event,
  ) => {
    if (!this.disposed) {
      this.emit(ObserverEvents.hoverIn, {
        target: event.currentTarget as Element,
        rect: match.getRect(),
        context: match.dataContext,
      } satisfies ObserverEventArg);
    }
  };

  private _onHoverOut = (
    match: HoverRangeMatch<MatchContextModel>,
    event: Event,
  ) => {
    if (!this.disposed) {
      this.emit(ObserverEvents.hoverOut, {
        target: event.currentTarget,
      });
    }
  };

  override dispose() {
    if (this._observer) {
      this._observer.disconnect();
      // release instance
      this._observer = undefined;
    }
    this._nodeConsumer.dispose();
    this._nodeQueue.clear();
    super.dispose();
  }
}
