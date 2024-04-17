import type { IRangeMatch } from './RangeMatch';

export interface NodeObserverProps {
  matcher: (node: Node) => IRangeMatch[] | undefined;
  observerOptions?: MutationObserverInit;
}

export interface INodeObserver {
  observe: (node: Node) => void;
  disconnect: () => void;
}
