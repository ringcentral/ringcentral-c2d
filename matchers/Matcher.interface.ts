export interface MatchContextModel {
  phoneNumber: string;
  country?: string;
  ext?: string;
}

export interface MatchProps {
  node: Node;
  validate?: boolean;
  children?: boolean;
}

export interface MatchModel {
  startsNode: Node;
  endsNode: Node;
  startsAt?: number;
  endsAt?: number;
  context: MatchContextModel;
}

export interface IMatcher {
  isValidNode(node: Node): boolean;
  isValidParentNode(node: Node): boolean;
  match(props: MatchProps): MatchModel[];
}
