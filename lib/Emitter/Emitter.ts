import { EventEmitter } from 'events';

export class Emitter {
  protected _emitter: EventEmitter;
  private _disposed: boolean = false;

  constructor() {
    this._emitter = new EventEmitter();
  }

  on(name, fn) {
    this._emitter.on(name, fn);
  }

  off(name, fn) {
    this._emitter.off(name, fn);
  }

  get disposed() {
    return this._disposed;
  }

  dispose() {
    if (!this.disposed) {
      this._emitter.removeAllListeners();
      this._emitter = null;
      this._disposed = true;
    }
  }
}
