// eslint-disable-next-line
/// <reference path='../global.d.ts'/>

import { RingCentralC2DWidget } from '../RingCentralC2DWidget';
import { RangeObserver as RingCentralC2DObserver } from '../../observers/RangeObserver';
import {
  IWidget,
  WidgetUpdateProps,
} from '../RingCentralC2DWidget/Widget.interface';
import { IObserver } from '../../observers/Observer.interface';
import { Emitter } from '../Emitter';

import { C2DEvents } from '../C2DEvents';
import { MatchContextModel } from '../../matchers/Matcher.interface';

export { C2DEvents };
interface RingCentralC2DProps {
  widget?: IWidget;
  observer?: IObserver;
  bubbleInIframe?: boolean;
}

function getFullPhoneNumber(context) {
  if (!context.ext) {
    return context.phoneNumber;
  }
  return `${context.phoneNumber}*${context.ext}`;
}

export class RingCentralC2D extends Emitter {
  static events = C2DEvents;

  private _bubblePhoneNumber: boolean = false;
  private _currentContext: MatchContextModel;

  private _widget: IWidget;
  private _observer: IObserver;

  constructor({
    widget = new RingCentralC2DWidget(),
    observer = new RingCentralC2DObserver(),
    bubbleInIframe = true,
  }: RingCentralC2DProps = {}) {
    super();

    this._widget = widget;
    this._observer = observer;

    this._observer.on(C2DEvents.hoverIn, this._onHoverIn);
    this._observer.on(C2DEvents.hoverOut, this._onHoverOut);

    this._widget.on(C2DEvents.call, this._onCallClick);
    this._widget.on(C2DEvents.text, this._onTextClick);

    this._bubblePhoneNumber = bubbleInIframe && window !== window.parent;
    if (bubbleInIframe) {
      this._initIframeBubblePhoneNumberListener();
    }
  }

  update({
    enableC2D,
    enableC2SMS,
    callBtnTitle,
    smsBtnTitle,
  }: WidgetUpdateProps) {
    this._widget.update({
      enableC2D,
      enableC2SMS,
      callBtnTitle,
      smsBtnTitle,
    });
  }

  dispose() {
    if (!this.disposed) {
      this._observer.off(C2DEvents.hoverIn, this._onHoverIn);
      this._observer.off(C2DEvents.hoverOut, this._onHoverOut);
      this._widget.off(C2DEvents.call, this._onCallClick);
      this._widget.off(C2DEvents.text, this._onTextClick);
      this._observer.dispose();
      this._widget.dispose();
      window.removeEventListener('message', this._onBubbleEvent);
      super.dispose();
    }
  }

  private _onHoverIn = ({ target, rect, context }) => {
    this._currentContext = context;
    this._widget.update({ numberHover: true });
    this._widget.showAt(rect || target);
  };

  private _onHoverOut = () => {
    this._widget.update({ numberHover: false });
  };

  private _onCallClick = () => {
    if (this._bubblePhoneNumber) {
      this._bubbleEvent(C2DEvents.call, this._currentContext);
      return;
    }
    const phoneNumber = getFullPhoneNumber(this._currentContext);
    this._emitter.emit(C2DEvents.call, phoneNumber);
  };

  private _onTextClick = () => {
    if (this._bubblePhoneNumber) {
      this._bubbleEvent(C2DEvents.text, this._currentContext);
      return;
    }
    const phoneNumber = getFullPhoneNumber(this._currentContext);
    this._emitter.emit(C2DEvents.text, phoneNumber);
  };

  private _initIframeBubblePhoneNumberListener() {
    window.addEventListener('message', this._onBubbleEvent);
  }

  private _onBubbleEvent = (event) => {
    const message = event.data;
    if (!message || message.type !== 'rc-c2d-phone-number-bubble') {
      return;
    }
    this._currentContext = JSON.parse(message.context);
    if (message.eventType === C2DEvents.call) {
      this._onCallClick();
      return;
    }
    if (message.eventType === C2DEvents.text) {
      this._onTextClick();
    }
  };

  private _bubbleEvent(eventType: string, context: MatchContextModel) {
    window.top.postMessage(
      {
        type: 'rc-c2d-phone-number-bubble',
        eventType,
        context: JSON.stringify(context),
      },
      '*',
    );
  }
}
