interface throttleFunc {
  (...args: any[]): any;
}

export interface Throttler {
  valid: (...args: any[]) => boolean;
}

export class DelayThrottler implements Throttler {
  private _last = 0;
  private _delay: number;

  constructor(delay: number) {
    this._delay = delay;
  }

  valid(): boolean {
    const now = Date.now();
    if (now - this._last > this._delay) {
      this._last = now;
      return true;
    }
    return false;
  }
}

export class EventDelayThrottler implements Throttler {
  private _delay: number;
  private _timeSet: Map<Element, number>;

  constructor(delay: number) {
    this._delay = delay;
    this._timeSet = new Map<Element, number>();
  }

  valid(event: Event) {
    const element = event.currentTarget as Element;
    const last = this._timeSet.get(element) || 0;
    const now = Date.now();
    if (now - last > this._delay) {
      this._timeSet.set(element, now);
      return true;
    }
    return false;
  }

  reset(target: Element): boolean {
    return this._timeSet.delete(target);
  }

  clear(): void {
    this._timeSet.clear();
  }
}

export function throttled(
  throttler: Throttler,
  func: throttleFunc,
): throttleFunc {
  if (!throttler) {
    throw new Error('[throttler] is required');
  }
  if (!func) {
    throw new Error('[func] is required');
  }
  return function delegateFunc(...args) {
    if (throttler.valid(...args)) {
      return func(...args);
    }
  };
}
