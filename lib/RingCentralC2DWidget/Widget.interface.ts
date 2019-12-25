import { Emitter } from '../Emitter';

export interface WidgetUpdateProps {
  enableC2D?: boolean;
  enableC2SMS?: boolean;
  callBtnTitle?: string;
  smsBtnTitle?: string;
  numberHover?: boolean;
}

export interface IWidget extends Emitter {
  update(props: WidgetUpdateProps): void;
  showAt(target: Element | ClientRect): void;
}
