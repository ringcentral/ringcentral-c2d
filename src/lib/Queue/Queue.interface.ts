export interface QueueMessage<TMessage> {
  message: TMessage;
  ts: number;
}

export interface Queue<TMessage> {
  enqueue: (message: QueueMessage<TMessage>) => void;
  dequeue: () => QueueMessage<TMessage> | undefined;
  length: () => number;
  clear: () => void;
}

export interface Producer<TMessage> {
  send: (message: TMessage) => void;
}

export interface Consumer<TMessage> {
  current: QueueMessage<TMessage>[];
  trigger: () => void;
  dispose: () => void;
}
