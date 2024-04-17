import { DelayThrottler, throttled } from '../throttle';

import type { StartToEndMatchProps } from './StartToEndMatch';
import { StartToEndMatch } from './StartToEndMatch';

enum EVENTS {
  click = 'click',
  hoverIn = 'hoverIn',
  hoverOut = 'hoverOut',
}

let _lastHovered: HoverRangeMatch | undefined;

export interface TaggableMouseEvent extends MouseEvent {
  hasBeenHandled?: boolean;
}

export interface HoverRangeMatchProps<IDataContext>
  extends StartToEndMatchProps {
  dataContext?: IDataContext;
}

export class HoverRangeMatch<
  IDataContext = { [key: string]: any },
> extends StartToEndMatch {
  events = EVENTS;

  constructor(private _matchProps: HoverRangeMatchProps<IDataContext>) {
    super(_matchProps);
    this._addEvents();
  }

  override dispose() {
    super.dispose();
    this._removeEvents();
  }

  get dataContext() {
    return this._matchProps.dataContext;
  }

  private _addEvents() {
    const node = this.getAncestorContainer();
    if (node) {
      node.addEventListener('click', this._clickHandler);
      node.addEventListener('mouseenter', this._mouseenterHandler);
      node.addEventListener('mouseleave', this._mouseleaveHandler);
      node.addEventListener('mousemove', this._mousemoveHandler);
    }
  }

  private _removeEvents() {
    const node = this.getAncestorContainer();
    if (node) {
      node.removeEventListener('click', this._clickHandler);
      node.removeEventListener('mouseenter', this._mouseenterHandler);
      node.removeEventListener('mouseleave', this._mouseleaveHandler);
      node.removeEventListener('mousemove', this._mousemoveHandler);
    }
  }

  // event handlers
  // event.target is what triggers the event dispatcher to trigger
  // event.currentTarget is what you assigned your listener to

  private _clickHandler: EventListener = (event: Event) => {
    if (event.target === event.currentTarget) {
      this._fireClick(event);
    }
  };

  private _mouseenterHandler: EventListener = (event: Event) => {
    if (event.target === event.currentTarget) {
      this.buildRect();
    }
  };

  private _mouseleaveHandler: EventListener = (event: Event) => {
    if (event.target === event.currentTarget) {
      this._fireHoverOut(event);
    }
  };

  private _mousemoveHandler: EventListener = throttled(
    new DelayThrottler(100),
    (event: TaggableMouseEvent) => {
      if (!event.hasBeenHandled && this.isMatch(event.x, event.y)) {
        event.hasBeenHandled = true; // fires only for the first match with event xy
        this._fireHoverIn(event);
      }
    },
  );

  private _fireClick(event: Event) {
    this.emit(EVENTS.click, this, event);
  }

  private _fireHoverIn(event: Event) {
    if (_lastHovered === this) {
      return;
    }
    if (_lastHovered) {
      this._fireHoverOut(event);
    }
    this.emit(EVENTS.hoverIn, this, event);
    _lastHovered = this as HoverRangeMatch;
  }

  private _fireHoverOut(event: Event) {
    if (_lastHovered) {
      _lastHovered.emit(EVENTS.hoverOut, _lastHovered, event);
      _lastHovered = undefined;
    }
  }
}
