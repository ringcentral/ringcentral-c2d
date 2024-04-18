import { Emitter } from './lib';
import {
  ObserverEvents,
  RangeObserver,
  type IObserver,
  type ObserverEventArg,
} from './observers';
import { BuiltinWidget, type IWidget } from './widgets';

interface RingCentralC2DProps {
  widget?: IWidget;
  observer?: IObserver;
}

export class RingCentralC2D {
  _widget: IWidget;
  _observer: IObserver;

  get widget() {
    return this._widget;
  }

  get observer() {
    return this._observer;
  }

  constructor({
    widget = new BuiltinWidget(),
    observer = new RangeObserver(),
  }: RingCentralC2DProps = {}) {
    this._widget = widget;
    this._observer = observer;

    this._observer.on(ObserverEvents.hoverIn, this._onHoverIn);
    this._observer.on(ObserverEvents.hoverOut, this._onHoverOut);
  }

  dispose() {
    if (this._widget instanceof Emitter && !this._observer.disposed) {
      this._observer.off(ObserverEvents.hoverIn, this._onHoverIn);
      this._observer.off(ObserverEvents.hoverOut, this._onHoverOut);
      this._observer.dispose();
    }
    if (this._widget instanceof Emitter && !this._widget.disposed) {
      this._widget.dispose();
    }
  }

  _onHoverIn = ({ target, rect, context }: ObserverEventArg) => {
    this._widget.setTarget({ target, rect, context });
  };

  _onHoverOut = () => {
    this._widget.setTarget(undefined);
  };
}
