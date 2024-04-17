import { DefaultConsumer } from './DefaultConsumer';
import type { DefaultConsumerOptions } from './DefaultConsumer';

const DEFAULT_DELAY = 200;
const DEFAULT_MAX_DELAY = 1000;
const DEFAULT_MAX_CONSUMPTION = 1;

export type DelayOptions = {
  delay: number;
  maxDelay: number;
  maxConsumption: number;
};

export type DelayedConsumerOptions<TMessage> =
  DefaultConsumerOptions<TMessage> & Partial<DelayOptions>;

export class DelayedConsumer<TMessage> extends DefaultConsumer<TMessage> {
  private _timer?: ReturnType<typeof setTimeout>;
  private _delayOptions: DelayOptions;

  constructor(protected override _options: DelayedConsumerOptions<TMessage>) {
    super(_options);

    this._delayOptions = {
      delay: _options.delay ?? DEFAULT_DELAY,
      maxDelay: _options.maxDelay ?? DEFAULT_MAX_DELAY,
      maxConsumption: _options.maxConsumption ?? DEFAULT_MAX_CONSUMPTION,
    };
  }

  private _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  override dispose() {
    this._clearTimer();
    super.dispose();
  }

  protected override _consumeNext() {
    this._dequeue();
    if (!this.current.length) {
      this._consuming = false;
      return;
    }
    this._clearTimer();
    // Once consumer has started consuming or the max delay of current message is exceeded.
    // We should start to consume message on next event loop (run asynchronously with delay 0).
    const nextTick =
      this._consuming ||
      Date.now() - this.current[0].ts > this._delayOptions.maxDelay;
    this._timer = setTimeout(
      this._consume,
      nextTick ? 0 : this._delayOptions.maxDelay,
    );
  }

  protected override _dequeue() {
    if (!this.current.length) {
      while (this.current.length < this._delayOptions.maxConsumption) {
        const message = this._options.queue.dequeue();
        if (!message) {
          break;
        }
        this.current.push(message);
      }
    }
  }

  protected override _consume = () => {
    this._timer = undefined;
    super._consume();
  };
}
