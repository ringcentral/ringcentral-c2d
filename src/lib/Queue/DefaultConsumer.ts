import type { Queue, Consumer, QueueMessage } from './Queue.interface';

export interface DefaultConsumerOptions<TMessage> {
  queue: Queue<TMessage>;
  onConsume?: () => void;
}

export class DefaultConsumer<TMessage> implements Consumer<TMessage> {
  protected _disposed = false;
  protected _consuming = false;
  current: QueueMessage<TMessage>[] = [];

  constructor(protected _options: DefaultConsumerOptions<TMessage>) {
    if (!_options.queue) {
      throw new Error('Queue is required');
    }
  }

  trigger() {
    if (this._disposed) {
      return;
    }
    if (!this._consuming) {
      this._consumeNext();
    }
  }

  dispose() {
    this._disposed = true;
    this._consuming = false;
  }

  protected _consumeNext() {
    this._dequeue();
    if (!this.current.length) {
      this._consuming = false;
      return;
    }
    this._consume();
  }

  protected _dequeue() {
    if (!this.current.length && this._options.queue.length()) {
      const message = this._options.queue.dequeue();
      if (message) this.current.push(message);
    }
  }

  protected _consume() {
    this._consuming = true;
    this._options.onConsume?.();
    this.current = [];
    if (!this._disposed) {
      this._consumeNext();
    }
  }
}
