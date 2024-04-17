import type { Queue, QueueMessage } from './Queue.interface';

const MAX_CAPACITY = 100 * 1000; // 100K

export class DefaultQueue<TMessage> implements Queue<TMessage> {
  private _queue: QueueMessage<TMessage>[] = [];

  constructor(protected maxCapacity = MAX_CAPACITY) {}

  enqueue(message: QueueMessage<TMessage>) {
    if (this.length() < this.maxCapacity) {
      this._queue.push(message);
    }
  }

  dequeue(): QueueMessage<TMessage> | undefined {
    return this._queue.shift();
  }

  length() {
    return this._queue.length;
  }

  clear() {
    this._queue = [];
  }
}
