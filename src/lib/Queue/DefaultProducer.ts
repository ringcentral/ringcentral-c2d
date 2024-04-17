import type { Queue, Producer } from './Queue.interface';

export class DefaultProducer<TMessage> implements Producer<TMessage> {
  constructor(private _queue: Queue<TMessage>) {}

  send(message: TMessage) {
    this._queue.enqueue({
      message,
      ts: Date.now(),
    });
  }
}
