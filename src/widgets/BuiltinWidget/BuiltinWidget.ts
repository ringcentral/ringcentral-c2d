import classnames from 'classnames';
import debounce from 'lodash/debounce';
import { getImagePositionColor } from '../../lib/utils/getImagePositionColor';

// @ts-ignore
// eslint-disable-next-line
import defaultLogo from '../../assets/icons/c2dLogo.png?url';
// @ts-ignore
// eslint-disable-next-line
import c2callIconData from '../../assets/images/c2call.svg?url';
// @ts-ignore
// eslint-disable-next-line
import c2textIconData from '../../assets/images/c2text.svg?url';
import { type MatchRect } from '../../lib/NodeObserver';
import { convertToInline } from '../../lib/convertToInline';
import type { MatchContextModel } from '../../matchers';
import { BaseWidget } from '../BaseWidget';
import { type IWidget, type TargetItem } from '../Widget.interface';

import {
  type BuiltinWidgetProps,
  type BuiltinWidgetUpdateProps,
} from './BuiltinWidget.interface';
import { BuiltinWidgetEvents } from './BuiltinWidgetEvents';
import styles from './styles.scss';

const C2D_WIDGET_TAGNAME = 'RC-C2D-WIDGET';
const c2dArrowColorVarName = '--c2d-arrow-color';
const c2callIcon = convertToInline(c2callIconData);
const c2textIcon = convertToInline(c2textIconData);

const defaultCallBtnTitle = 'Call with RingCentral';
const defaultTextBtnTitle = 'SMS with RingCentral';
const defaultCancelHoverTime = 10 * 1000;

const styleEl = Array.from(document.querySelectorAll('style')).find(
  (el) =>
    el.innerHTML.indexOf(styles.c2dWidget) > -1 &&
    el.innerHTML.indexOf('https://rc-hack-c2d.detect') > -1,
);
if (styleEl) {
  styleEl.remove();
}

function preventDefault(e: Event) {
  e.stopPropagation();
  e.preventDefault();
}

function getFullPhoneNumber(matchContext: MatchContextModel) {
  if (!matchContext.ext) {
    return matchContext.phoneNumber;
  }
  return `${matchContext.phoneNumber}*${matchContext.ext}`;
}

export class BuiltinWidget extends BaseWidget implements IWidget {
  _rootEl?: HTMLElement;
  _logoEl?: HTMLImageElement;
  _callBtn?: HTMLElement;
  _textBtn?: HTMLElement;
  _separatorLine?: HTMLElement;

  _enableC2Call = true;
  _enableC2Text = true;
  _callBtnTitle = defaultCallBtnTitle;
  _textBtnTitle = defaultTextBtnTitle;

  _leftHandSide = false;
  _widgetHovering = false;
  _numberHovering = false;
  _currentTargetItem?: TargetItem;

  _logoIcon = this._props.logoIcon || defaultLogo;
  _arrowColor = '#ff8800';

  get events() {
    return BuiltinWidgetEvents;
  }

  constructor(
    protected _props: BuiltinWidgetProps = {
      bubbleInIframe: true,
    },
  ) {
    super(_props);
    this._injectDOM();
  }

  setTarget(item?: TargetItem) {
    this._numberHovering = !!item;
    this._renderClasses();
    if (this._props.autoHide && item) {
      this._cancelNumberHover();
    }
    if (item) {
      this._currentTargetItem = item;
      this._updatePosition(item.rect);
    }
  }

  _cancelNumberHover = debounce(() => {
    this.setTarget(undefined);
  }, defaultCancelHoverTime);

  _updatePosition(rect: MatchRect) {
    const rootEl = this._rootEl;
    if (rect && rootEl) {
      const leftHandSide = window.innerWidth - rect.right < 90;
      if (this._leftHandSide !== leftHandSide) {
        this._leftHandSide = leftHandSide;
        this._renderClasses();
      }

      /**
       * position: fixed can be affected by composition layers. We cannot safely assume the
       * 0 position of a fixed element.
       * Here we reset the transform and use the position of the widget with no transform
       * as the 0 position, and then calculate the offset to move the widget
       * to the right position.
       */

      // reset position
      rootEl.style.transform = 'translate(0, 0)';
      const widgetRect = rootEl.getBoundingClientRect();

      const startLineHeight = rect.startLineHeight || rect.height;
      const endLineHeight = rect.endLineHeight || rect.height;

      // calculate widget position offset, dispose decimals to avoid fuzzy images
      const targetTop = Math.floor(
        this._leftHandSide
          ? rect.bottom - endLineHeight / 2 - widgetRect.height / 2
          : rect.top + startLineHeight / 2 - widgetRect.height / 2,
      );
      const targetLeft = Math.floor(
        this._leftHandSide ? rect.left - widgetRect.width : rect.right,
      );

      // move the widget to the right position
      rootEl.style.transform = `translate(${targetLeft}px, ${targetTop}px)`;
    }
  }

  update({
    enableC2Call = this._enableC2Call,
    enableC2Text = this._enableC2Text,
    callBtnTitle = this._callBtnTitle,
    textBtnTitle = this._textBtnTitle,
    logoUrl,
    rootStyle,
  }: BuiltinWidgetUpdateProps) {
    // classes
    this._enableC2Call = enableC2Call;
    this._enableC2Text = enableC2Text;
    this._renderClasses();

    // titles
    this._callBtnTitle = callBtnTitle;
    this._textBtnTitle = textBtnTitle;
    this._renderTitles();

    // rootStyle
    const root = this._rootEl;
    if (rootStyle && root) {
      root.style.cssText = rootStyle;
      root.style.setProperty(c2dArrowColorVarName, this._arrowColor);
    }

    // logoUrl
    const logo = this._logoEl;
    if (logoUrl && logo) {
      this._logoIcon = logoUrl;
      logo.src = logoUrl;
      this._setArrowColor(logoUrl);
    }
  }

  override dispose() {
    if (!this.disposed) {
      super.dispose();
      this._cleanDOM();
    }
  }

  _onHoverOutWidget = () => {
    this._widgetHovering = false;
    this._renderClasses();
  };

  _onHoverInWidget = () => {
    this._widgetHovering = true;
    this._renderClasses();
  };

  _onCallClick = () => {
    this._fireEvent(BuiltinWidgetEvents.call);
  };

  _onTextClick = () => {
    this._fireEvent(BuiltinWidgetEvents.text);
  };

  _fireEvent(eventName: BuiltinWidgetEvents) {
    const phoneNumber = this._currentTargetItem
      ? getFullPhoneNumber(this._currentTargetItem.context!)
      : '';
    this.emit(eventName, phoneNumber, this._currentTargetItem?.context);
  }

  _injectDOM() {
    if (this._rootEl) {
      return;
    }

    const {
      root = '',
      logo = '',
      callButton = '',
      textButton = '',
      separatorLine = '',
      arrow = '',
    } = this._props.styles || {};

    this._rootEl = document.createElement(C2D_WIDGET_TAGNAME);
    this._rootEl.id = styles.c2dWidget;
    this._rootEl.style.cssText = root;
    this._rootEl.innerHTML = `
      <div class="${styles.c2dWrapper}">
        <img class="${styles.c2dLogo}" src="${this._logoIcon}" style="${logo}" />
        <div class="${styles.callBtn}" style="${callButton}">
          ${c2callIcon}
        </div>
        <div class="${styles.separatorLine}" style="${separatorLine}"></div>
        <div class="${styles.textBtn}" style="${textButton}">
          ${c2textIcon}
        </div>
      </div>
      <div class="${styles.arrow}" style="${arrow}">
        <div class="${styles.innerArrow}"></div>
      </div>
    `;

    this._logoEl = this._rootEl.querySelector<HTMLImageElement>(
      `.${styles.c2dLogo}`,
    )!;
    this._callBtn = this._rootEl.querySelector(`.${styles.callBtn}`)!;
    this._textBtn = this._rootEl.querySelector(`.${styles.textBtn}`)!;
    this._separatorLine = this._rootEl.querySelector(
      `.${styles.separatorLine}`,
    )!;

    this._rootEl.setAttribute('class', styles.c2dWidget);
    this._rootEl.addEventListener('mouseenter', this._onHoverInWidget);
    this._rootEl.addEventListener('mouseleave', this._onHoverOutWidget);
    // In case the widget is moved into a button or link, clicking on the widget should not trigger
    // the button or link itself to be invoked.
    this._rootEl.addEventListener('click', preventDefault);

    this._callBtn.addEventListener('click', this._onCallClick);
    this._textBtn.addEventListener('click', this._onTextClick);

    this._setArrowColor(this._logoIcon);
    this._renderClasses();
    this._renderTitles();

    if (styleEl && !styleEl.parentElement) {
      document.head.appendChild(styleEl);
      this.addObserveNode(styleEl);
    }
    if (this._rootEl && this._rootEl.parentElement !== document.body) {
      document.body.appendChild(this._rootEl);
      this.addObserveNode(this._rootEl);
    }
  }

  async _setArrowColor(logoUrl: string) {
    if (!this._rootEl || !logoUrl) return;

    const arrowColor = await getImagePositionColor(logoUrl, {
      // use 10 to avoid got the border color
      x: 10,
      y: 150,
    });
    this._arrowColor = arrowColor;
    this._rootEl.style.setProperty(c2dArrowColorVarName, arrowColor);
  }

  _renderTitles() {
    this._callBtn?.setAttribute('title', this._callBtnTitle);
    this._textBtn?.setAttribute('title', this._textBtnTitle);
  }

  _renderClasses() {
    this._rootEl?.setAttribute(
      'class',
      classnames(styles.c2dWidget, this._leftHandSide && styles.left, {
        [styles.visible]: this._widgetHovering || this._numberHovering,
      }),
    );
    this._callBtn?.setAttribute(
      'class',
      classnames(styles.callBtn, this._enableC2Call && styles.visible),
    );
    this._textBtn?.setAttribute(
      'class',
      classnames(styles.textBtn, this._enableC2Text && styles.visible),
    );
    this._separatorLine?.setAttribute(
      'class',
      classnames(
        styles.separatorLine,
        this._enableC2Call && this._enableC2Text && styles.visible,
      ),
    );
  }

  _cleanDOM() {
    this._callBtn?.removeEventListener('click', this._onCallClick);
    this._callBtn = undefined;
    this._textBtn?.removeEventListener('click', this._onTextClick);
    this._textBtn = undefined;
    this._rootEl?.removeEventListener('mouseenter', this._onHoverInWidget);
    this._rootEl?.removeEventListener('mouseleave', this._onHoverOutWidget);
    this._rootEl?.removeEventListener('click', preventDefault);
    this._rootEl?.remove();
    this._rootEl = undefined;
    styleEl?.remove();
  }
}
