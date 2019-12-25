import classnames from 'classnames';
import { convertToInline } from '../convertToInline';
import { C2DEvents } from '../C2DEvents';

// eslint-disable-next-line
import defaultLogo from '!url-loader?limit=102400!../icons/roundIcon.png';
// eslint-disable-next-line
import c2dIconData from '!url-loader?limit=102400!../icons/c2d.svg';
// eslint-disable-next-line
import c2smsIconData from '!url-loader?limit=102400!../icons/c2sms.svg';

import styles from './styles.scss';
import { IWidget } from './Widget.interface';
import { isContentEditable } from '../editorDetectors';
import { Emitter } from '../Emitter';

const RC_C2D_WIDGET_TAGNAME: string = 'RC-C2D-MENU';

const c2dIcon = convertToInline(c2dIconData);
const c2smsIcon = convertToInline(c2smsIconData);

const defaultCallBtnTitle: string = 'Call with RingCentral';
const defaultSmsBtnTitle: string = 'SMS with RingCentral';

const styleEl = Array.from(document.querySelectorAll('style')).find(
  (el) =>
    el.innerHTML.indexOf(styles.c2dMenu) > -1 &&
    el.innerHTML.indexOf('https://rc-hack-c2d.detect') > -1,
);
if (styleEl) {
  styleEl.remove();
}

interface RingCentralC2DWidgetProps {
  logoIcon?: string;
}

function preventDefault(e) {
  e.stopPropagation();
  e.preventDefault();
}

export class RingCentralC2DWidget extends Emitter implements IWidget {
  private get _logoIcon(): string {
    return this._props.logoIcon || defaultLogo;
  }

  private _selfObserver: MutationObserver;

  private _enableC2D: boolean = true;
  private _enableC2SMS: boolean = true;

  private _callBtn: HTMLElement;
  private _smsBtn: HTMLElement;
  private _separatorLine: HTMLElement;

  private _callBtnTitle: string = defaultCallBtnTitle;
  private _smsBtnTitle: string = defaultSmsBtnTitle;

  private _menuEl: HTMLElement;
  private _menuLeft: boolean = false;
  private _menuHover: boolean = false;
  private _numberHover: boolean = false;

  constructor(protected _props: RingCentralC2DWidgetProps = {}) {
    super();
    this._injectMenu();
    this._initSelfObserver();
  }

  update({
    enableC2D = this._enableC2D,
    enableC2SMS = this._enableC2SMS,
    callBtnTitle = this._callBtnTitle,
    smsBtnTitle = this._smsBtnTitle,
    numberHover = this._numberHover,
  }) {
    // classes
    this._enableC2D = enableC2D;
    this._enableC2SMS = enableC2SMS;
    this._numberHover = numberHover;
    this._resetLocation();
    this._renderClasses();
    // titles
    this._callBtnTitle = callBtnTitle;
    this._smsBtnTitle = smsBtnTitle;
    this._renderTitles();
  }

  private _resetLocation() {
    if (
      !this._numberHover &&
      !this._menuHover &&
      this._menuEl.parentElement !== document.body
    ) {
      document.body.appendChild(this._menuEl);
    }
  }

  get events() {
    return C2DEvents;
  }

  showAt(target: Element | ClientRect) {
    if (target) {
      let rect;
      if (target instanceof Element) {
        if (!isContentEditable(target)) {
          target.appendChild(this._menuEl);
        }
        rect = target.getBoundingClientRect();
      } else {
        rect = target;
      }

      const menuLeft = window.innerWidth - rect.right < 90;
      if (this._menuLeft !== menuLeft) {
        this._menuLeft = menuLeft;
        this._renderClasses();
      }

      /**
       * position: fixed can be affected by composition layers. We cannot safely assume the
       * 0 position of a fixed element.
       * Here we reset the transform and use the position of the menu with no transform
       * as the 0 position, and then calculate the offset to move the menu
       * to the right position.
       */

      // reset position
      this._menuEl.style.transform = 'translate(0, 0)';
      const menuRect = this._menuEl.getBoundingClientRect();

      const startLineHeight: number = rect.startLineHeight || rect.height;
      const endLineHeight: number = rect.endLineHeight || rect.height;

      // calculate menu position offset, dispose decimals to avoid fuzzy images
      const targetTop = Math.floor(
        this._menuLeft
          ? rect.bottom - endLineHeight / 2 - menuRect.height / 2
          : rect.top + startLineHeight / 2 - menuRect.height / 2,
      );
      const targetLeft = Math.floor(
        this._menuLeft ? rect.left - menuRect.width : rect.right,
      );

      // move the menu to the right position
      this._menuEl.style.transform = `translate(${targetLeft}px, ${targetTop}px)`;
    }
  }

  private _onMenuHoverOut = () => {
    this._menuHover = false;
    this._resetLocation();
    this._renderClasses();
  };

  private _onMenuHoverIn = () => {
    this._menuHover = true;
    this._resetLocation();
    this._renderClasses();
  };

  dispose() {
    if (!this.disposed) {
      this._cleanObserver();
      this._cleanMenu();
      super.dispose();
    }
  }

  private _initSelfObserver() {
    this._selfObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.removedNodes) {
          mutation.removedNodes.forEach((node) => {
            if (
              this._menuEl &&
              this._menuEl === node &&
              !this._menuEl.parentElement
            ) {
              document.body.appendChild(this._menuEl);
            }
            if (styleEl && styleEl === node && !styleEl.parentElement) {
              document.head.appendChild(styleEl);
            }
          });
        }
      }
    });
    this._selfObserver.observe(document.body, { childList: true });
    this._selfObserver.observe(document.head, { childList: true });
  }

  private _cleanObserver() {
    if (this._selfObserver) {
      this._selfObserver.disconnect();
      this._selfObserver = null;
    }
  }

  private _onCallClick = (ev: MouseEvent) => {
    this._emitter.emit(C2DEvents.call, ev);
  };

  private _onSmsClick = (ev: MouseEvent) => {
    this._emitter.emit(C2DEvents.text, ev);
  };

  private _injectMenu() {
    if (this._menuEl) {
      return;
    }

    this._menuEl = document.createElement(RC_C2D_WIDGET_TAGNAME);
    this._menuEl.id = styles.c2dMenu;
    this._menuEl.innerHTML = `
      <div class="${styles.c2dMenuWrapper}">
        <img class="${styles.c2dLogo}" src="${this._logoIcon}" />
        <div class="${styles.callBtn}">
          ${c2dIcon}
        </div>
        <div class="${styles.separatorLine}"></div>
        <div class="${styles.smsBtn}">
          ${c2smsIcon}
        </div>
      </div>
      <div class="${styles.arrow}">
        <div class="${styles.innerArrow}"></div>
      </div>
    `;
    this._menuEl.setAttribute('class', styles.c2dMenu);
    this._menuEl.addEventListener('mouseenter', this._onMenuHoverIn);
    this._menuEl.addEventListener('mouseleave', this._onMenuHoverOut);
    // In case the menu is moved into a button or link, clicking on the menu should not trigger
    // the button or link itself to be invoked.
    this._menuEl.addEventListener('click', preventDefault);

    this._callBtn = this._menuEl.querySelector(`.${styles.callBtn}`);
    this._callBtn.addEventListener('click', this._onCallClick);

    this._smsBtn = this._menuEl.querySelector(`.${styles.smsBtn}`);
    this._smsBtn.addEventListener('click', this._onSmsClick);

    this._separatorLine = this._menuEl.querySelector(
      `.${styles.separatorLine}`,
    );

    this._renderClasses();
    this._renderTitles();

    if (styleEl && !styleEl.parentElement) {
      document.head.appendChild(styleEl);
    }
    if (this._menuEl.parentElement !== document.body) {
      document.body.appendChild(this._menuEl);
    }
  }

  private _renderTitles() {
    if (this._callBtn) {
      this._callBtn.setAttribute('title', this._callBtnTitle);
    }
    if (this._smsBtn) {
      this._smsBtn.setAttribute('title', this._smsBtnTitle);
    }
  }

  private _renderClasses() {
    if (this._menuEl) {
      this._menuEl.setAttribute(
        'class',
        classnames(styles.c2dMenu, this._menuLeft && styles.left, {
          [styles.visible]: this._menuHover || this._numberHover,
        }),
      );
      this._callBtn.setAttribute(
        'class',
        classnames(styles.callBtn, this._enableC2D && styles.visible),
      );
      this._smsBtn.setAttribute(
        'class',
        classnames(styles.smsBtn, this._enableC2SMS && styles.visible),
      );
      this._separatorLine.setAttribute(
        'class',
        classnames(styles.separatorLine, this._enableC2SMS && styles.visible),
      );
    }
  }

  private _cleanMenu() {
    if (this._menuEl) {
      this._callBtn.removeEventListener('click', this._onCallClick);
      this._callBtn = null;

      this._smsBtn.removeEventListener('click', this._onSmsClick);
      this._smsBtn = null;

      this._menuEl.removeEventListener('mouseenter', this._onMenuHoverIn);
      this._menuEl.removeEventListener('mouseleave', this._onMenuHoverOut);
      this._menuEl.removeEventListener('click', preventDefault);
      this._menuEl.remove();
      this._menuEl = null;
    }
    if (styleEl) {
      styleEl.remove();
    }
  }
}
