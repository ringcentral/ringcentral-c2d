import { isContentEditable } from '../utilities';

import { SingleNodeMatch } from './SingleNodeMatch';

const EVENTS = {
  focus: 'focus',
  blur: 'blur',
  change: 'change',
  dispose: 'dispose',
};

let _lastFocused: ValueNodeMatch | undefined;

export type ValueNodeType =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export interface ValueNodeMatchProps<IDataContext> {
  node: ValueNodeType;
  dataContext?: IDataContext;
}

export class ValueNodeMatch<
  IDataContext = { [key: string]: any },
> extends SingleNodeMatch {
  private _monitorId?: number;

  events = EVENTS;

  constructor(private _matchProps: ValueNodeMatchProps<IDataContext>) {
    super(_matchProps.node);
    this._addEvents();
    this._startMonitor();
  }

  override dispose() {
    this.emit(EVENTS.dispose, this);
    super.dispose();
    this._removeEvents();
    this._stopMonitor();
  }

  get dataContext() {
    return this._matchProps.dataContext;
  }

  getValue() {
    if (isContentEditable(this._matchProps.node as HTMLElement)) {
      return this._matchProps.node.innerHTML;
    }
    return this._matchProps.node.value;
  }

  setValue(value: string) {
    if (isContentEditable(this._matchProps.node)) {
      this._matchProps.node.innerHTML = value;
    } else {
      this._matchProps.node.value = value;
      this._matchProps.node.dispatchEvent(new Event('change'));
    }
  }

  private _addEvents() {
    const node = this.getAncestorContainer();
    if (node) {
      node.addEventListener('focus', this._focusHandler);
      node.addEventListener('click', this._focusHandler);
      node.addEventListener('blur', this._blurHandler);
      node.addEventListener('change', this._changeHandler);
    }
  }

  private _removeEvents() {
    const node = this.getAncestorContainer();
    if (node) {
      node.removeEventListener('focus', this._focusHandler);
      node.removeEventListener('click', this._focusHandler);
      node.removeEventListener('blur', this._blurHandler);
      node.removeEventListener('change', this._changeHandler);
    }
  }

  // Start a monitor to observe nodes that are disabled.
  // Nodes that are disabled will not trigger change event.
  private _startMonitor() {
    this._stopMonitor();
    let lastValue = this.getValue();
    this._monitorId = window.setInterval(() => {
      const value = this.getValue();
      if (lastValue !== value) {
        lastValue = value;
        this.emit(EVENTS.change, this);
      }
    }, 100);
  }

  private _stopMonitor() {
    if (this._monitorId) {
      clearInterval(this._monitorId);
      this._monitorId = undefined;
    }
  }

  private _focusHandler: EventListener = (event: Event) => {
    if (event.target === event.currentTarget) {
      this._stopMonitor(); // prior 'change' event
      this.buildRect();
      this._fireFocus(event);
    }
  };

  private _blurHandler: EventListener = (event: Event) => {
    if (event.target === event.currentTarget) {
      this._startMonitor(); // prior 'change' event
      this._fireBlur(event);
    }
  };

  private _changeHandler: EventListener = (event: Event) => {
    this._stopMonitor(); // prior 'change' event
    this.emit(EVENTS.change, this, event);
    this._startMonitor(); // prior 'change' event
  };

  private _fireFocus(event: Event) {
    if (_lastFocused === this) {
      return;
    }
    if (_lastFocused) {
      this._fireBlur(event);
    }
    this.emit(EVENTS.focus, this, event);
    _lastFocused = this as ValueNodeMatch;
  }

  private _fireBlur(event: Event) {
    if (_lastFocused) {
      _lastFocused.emit(EVENTS.blur, _lastFocused, event);
      _lastFocused = undefined;
    }
  }
}
