import { Emitter } from '../lib/Emitter';

const BUBBLE_EVENTS_CHANNEL = 'rc-c2d-bubble-events';

interface BaseWidgetProps {
  bubbleInIframe?: boolean;
}

interface BubbleEventMessage {
  channel: string;
  eventName: string | symbol;
  eventArgs: string;
}

export class BaseWidget extends Emitter {
  _shouldBubbleEvents: boolean;
  _selfObserver?: MutationObserver;
  _observeNodes: Map<Node, Node> = new Map();

  constructor(_props: BaseWidgetProps = {}) {
    super();

    this._shouldBubbleEvents =
      !!_props.bubbleInIframe && window !== window.parent;
    if (_props.bubbleInIframe) {
      this._addBubbleEventListeners();
    }
  }

  _addBubbleEventListeners() {
    window.addEventListener('message', this._onBubbleEvent);
    // Intercept emitting all events
    this._onBeforeEmit = (eventName, ...eventArgs) => {
      if (!this._shouldBubbleEvents) {
        // Continue emit
        return true;
      }
      this._applyBubbleEvent({
        channel: BUBBLE_EVENTS_CHANNEL,
        eventName,
        eventArgs: JSON.stringify(eventArgs),
      });
      // Cancel emit
      return false;
    };
  }

  _removeBubbleEventListeners() {
    window.removeEventListener('message', this._onBubbleEvent);
    this._onBeforeEmit = undefined;
  }

  _onBubbleEvent = (event: MessageEvent<BubbleEventMessage | undefined>) => {
    const message = event.data;
    if (message?.channel === BUBBLE_EVENTS_CHANNEL) {
      this._applyBubbleEvent(message);
    }
  };

  _applyBubbleEvent(message: BubbleEventMessage) {
    if (this._shouldBubbleEvents) {
      window.top?.postMessage(message, '*');
    } else {
      const eventArgs: any[] = JSON.parse(message.eventArgs);
      this.emit(message.eventName, ...eventArgs);
    }
  }

  /**
   * Add a node to be observed for avoiding being removed from the DOM
   * @param node The node to be observed
   */
  addObserveNode(node: Node) {
    if (!node.parentElement) {
      throw new Error(
        'Please insert the node to the DOM first before start observing it',
      );
    }
    this._observeNodes.set(node, node.parentElement);
    if (!this._selfObserver) {
      this._initSelfObserver();
    }
  }

  /**
   * Remove a node from the observe list
   * @param node The node to be removed from the observe list
   */
  removeObserveNode(node: Node) {
    this._observeNodes.delete(node);
    if (this._observeNodes.size === 0) {
      this._disconnectObserver();
    }
  }

  _initSelfObserver() {
    this._selfObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.removedNodes) {
          mutation.removedNodes.forEach((node) => {
            const parentElement = this._observeNodes.get(node);
            if (parentElement && node.parentElement !== parentElement) {
              parentElement.appendChild(node);
            }
          });
        }
      }
    });
    this._selfObserver.observe(document.body, { childList: true });
    this._selfObserver.observe(document.head, { childList: true });
  }

  _disconnectObserver() {
    if (this._selfObserver) {
      this._selfObserver.disconnect();
      this._selfObserver = undefined;
    }
  }

  override dispose() {
    this._removeBubbleEventListeners();
    this._disconnectObserver();
    super.dispose();
  }
}
