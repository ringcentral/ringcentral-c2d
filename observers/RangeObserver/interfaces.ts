export interface MatchProps {
  startsNode: Node;
  startsAt: number;
  endsNode: Node;
  endsAt: number;
  context: any;
}

export interface TaggableMouseEvent extends MouseEvent {
  hasBeenHandled: boolean;
}

export interface MatchRect extends ClientRect {
  startLineHeight: number;
  endLineHeight: number;
}

export interface IMatchObject extends MatchProps {
  readonly rect: MatchRect;
  readonly context: any;
}

export interface ObserverProps {
  matcher: (node: Node, children: boolean) => MatchProps[];
  onHoverIn?: (target: Element, match: IMatchObject) => void;
  onHoverOut?: (target: Element) => void;
  observerOptions?: MutationObserverInit;
}
