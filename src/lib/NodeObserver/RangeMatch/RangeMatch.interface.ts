import type { Emitter } from '../../Emitter';

export interface MatchRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
  startLineHeight?: number;
  endLineHeight?: number;
}

export interface IRangeMatch extends Emitter {
  get startsNode(): Node;
  get endsNode(): Node;
  readonly endsAt?: number;
  readonly startsAt?: number;
  involves: (node: Node) => boolean;
  getRect: () => MatchRect | undefined;
  getAncestorContainer: () => Element | undefined;
}
