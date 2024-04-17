import { EventEmitter } from 'events';

export class Emitter {
  protected _emitter?: EventEmitter;
  protected _onBeforeEmit?: (
    eventName: string | symbol,
    ...args: any[]
  ) => boolean;

  constructor() {
    this._emitter = new EventEmitter();
  }

  emit(eventName: string | symbol, ...args: any[]) {
    if (!this._onBeforeEmit || this._onBeforeEmit(eventName, ...args)) {
      // * due to cross project issue, need set as any to avoid npm "events" type is not same sa "node:events"
      this._emitter?.emit(eventName as any, ...args);
    }
  }

  on(eventName: string | symbol, listener: (...args: any[]) => void) {
    this._emitter?.addListener(eventName, listener);
  }

  off(eventName: string | symbol, listener: (...args: any[]) => void) {
    this._emitter?.removeListener(eventName, listener);
  }

  get disposed() {
    return !this._emitter;
  }

  dispose() {
    if (this._emitter) {
      this._emitter.removeAllListeners();
      this._emitter = undefined;
      this._onBeforeEmit = undefined;
    }
  }
}
