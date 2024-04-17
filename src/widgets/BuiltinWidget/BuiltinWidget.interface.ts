export interface BuiltinWidgetProps {
  logoIcon?: string;
  /** As an option to automatically hide the number text when it is hovered. */
  autoHide?: boolean;
  /** style apply for elements */
  styles?: {
    root?: string;
    logo?: string;
    callButton?: string;
    textButton?: string;
    separatorLine?: string;
    arrow?: string;
  };
}

export interface BuiltinWidgetUpdateProps {
  enableC2Call?: boolean;
  enableC2Text?: boolean;
  callBtnTitle?: string;
  textBtnTitle?: string;
  logoUrl?: string;
  rootStyle?: string;
}
