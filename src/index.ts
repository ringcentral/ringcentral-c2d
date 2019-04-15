import { findNumbers, CountryCode } from 'libphonenumber-js';

const RC_C2D_TAGNAME = 'RC-WIDGET-C2D';
const RC_C2D_ELEM_TAGNAME = 'RC-WIDGET-C2D-MENU';
const RC_C2D_ELEM_ATTRIBUTE = 'DATA_PHONE_NUMBER';
const RC_C2D_MENU_HEIGHT = 30;

const NODE_TEYPE_EXCLUDES = ['STYLE', 'OPTION', 'SCRIPT', 'TEXT', 'TEXTAREA', RC_C2D_ELEM_TAGNAME];

const DEFAULT_LOGO = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${RC_C2D_MENU_HEIGHT}" height="${RC_C2D_MENU_HEIGHT}" viewBox="0 0 16 16">
    <g fill="none" fill-rule="evenodd">
      <rect width="16" height="16" fill="#F80" rx="3.75"/>
      <path fill="#FFF" d="M5.846 2h4.308c1.337 0 1.822.14 2.311.4.49.262.873.646 1.134 1.135.262.489.401.974.401 2.31v7.976c0 .062-.006.085-.019.108a.127.127 0 0 1-.052.052c-.023.013-.046.019-.108.019H5.846c-1.337 0-1.822-.14-2.311-.4A2.726 2.726 0 0 1 2.4 12.464c-.262-.489-.401-.974-.401-2.31v-4.31c0-1.336.14-1.821.4-2.31A2.726 2.726 0 0 1 3.536 2.4C4.024 2.139 4.509 2 5.845 2z"/>
      <path fill="#0684BD" d="M5.078 3.813h5.84c.7 0 1.266.566 1.266 1.265v2.953c0 .925-.874 1.505-1.511 1.692.285.54.733 1.356 1.343 2.449H9.953L8.592 9.815h-.088a.28.28 0 0 1-.28-.28V7.883h1.898V5.873H5.881v3.604c0 .6.118 1.64 1.025 2.695H4.843c-.758-.555-1.03-1.689-1.03-2.357V5.078c0-.699.566-1.266 1.265-1.266z"/>
    </g>
  </svg>
`;

function isTelLinkNode(node: HTMLElement) : boolean {
  return node.tagName === 'A' && (node.matches('a[href^="tel:"]') || node.matches('a[href^="sms:"]'));
}

function getAllNumberNodes(rootNode: any) : any[]{
  let numberNodes = [];
  if (
    !rootNode ||
    NODE_TEYPE_EXCLUDES.indexOf(rootNode.tagName) > -1 ||
    rootNode.nodeType ===  Node.COMMENT_NODE
  ) {
    return numberNodes;
  }
  if (rootNode.tagName === 'INPUT' && rootNode.type === 'text' && rootNode.value) {
    if (rootNode.value.replace(/[^\d]/g, '').length > 1) {
      numberNodes.push(rootNode);
    }
    return numberNodes;
  }
  if (rootNode.nodeType === Node.TEXT_NODE) {
    if (rootNode.data && rootNode.data.replace(/[^\d]/g, '').length > 1) {
      numberNodes.push(rootNode);
    }
    return numberNodes;
  }
  if (isTelLinkNode(rootNode)) {
    numberNodes.push(rootNode);
    return numberNodes;
  }
  let node = rootNode.firstChild;
  while (!!node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.data && node.data.replace(/[^\d]/g, '').length > 1) {
        numberNodes.push(node);
      }
    } else if (isTelLinkNode(node)) {
      numberNodes.push(node);
    } else {
      numberNodes = numberNodes.concat(getAllNumberNodes(node));
    }
    node = node.nextSibling;
  }
  return numberNodes;
}

export default class ClickToDialInject {
  private _onSmsClickFuncs : ((number) => void)[];
  private _onCallClickFuncs : ((number) => void)[];
  private _elemObserver : MutationObserver;
  private _C2DMenuObserver : MutationObserver;
  private _c2dMenuEl : HTMLElement;
  private _callBtn : HTMLElement;
  private _smsBtn : HTMLElement;
  private _c2dNumberHover : boolean;
  private _c2dMenuHover : boolean;
  private _currentNumber : string;
  private _countryCode : CountryCode;
  private _c2dMenuLeft : boolean;
  private _bubblePhoneNumber : boolean;
  private _enabled : boolean;
  private _logoIcon : string;
  private _callBtnTitle : string;
  private _smsBtnTitle : string;

  constructor({
    onSmsClick,
    onCallClick,
    countryCode = 'US',
    bubbleInIframe = true,
    enabled = true,
    logoIcon = DEFAULT_LOGO,
    callBtnTitle = 'Call with RingCentral',
    smsBtnTitle = 'SMS with RingCentral',
  } : {
    onSmsClick?: (phoneNumber: number) => void,
    onCallClick?: (phoneNumber: number) => void,
    countryCode: CountryCode,
    bubbleInIframe: boolean,
    enabled: boolean,
    logoIcon: string,
    callBtnTitle: string,
    smsBtnTitle: string,
  }) {
    this._onSmsClickFuncs = [];
    this._onCallClickFuncs = [];
    if (onSmsClick) {
      this._onSmsClickFuncs.push(onSmsClick);
    }
    if (onCallClick) {
      this._onCallClickFuncs.push(onCallClick);
    }
    this._enabled = enabled;
    this._countryCode = countryCode
    this._bubblePhoneNumber = bubbleInIframe && window !== window.parent;
    this._elemObserver = null;
    this._c2dMenuEl = null;
    this._c2dNumberHover = false;
    this._currentNumber = null;
    this._logoIcon = logoIcon;
    this._callBtnTitle = callBtnTitle;
    this._smsBtnTitle = smsBtnTitle;
    if (this._enabled) {
      this.start();
    }
    if (bubbleInIframe) {
      this._initIframeBubblePhoneNumberListener();
    }
  }

  _initObserver() {
    this._elemObserver = new MutationObserver(mutations => {
      let addedNumberNodes = [];
      let removedNodes = [];
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          addedNumberNodes = addedNumberNodes.concat(getAllNumberNodes(node));
        });
        mutation.removedNodes.forEach((node) => {
          removedNodes = removedNodes.concat(getAllNumberNodes(node));
        });
      });
      this._handlePhoneNumberNodes(addedNumberNodes);
      this._removeC2Dhandler(removedNodes);
    });
    this._elemObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
    this._C2DMenuObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (!mutation.removedNodes || mutation.removedNodes.length === 0) {
          return;
        }
        mutation.removedNodes.forEach((node) => {
          if (this._c2dMenuEl && node === this._c2dMenuEl && !this._c2dMenuEl.parentElement) {
            document.body.appendChild(this._c2dMenuEl);
          }
        });
      });
    });
    this._C2DMenuObserver.observe(document.body, { childList: true });
    const numberNodes = getAllNumberNodes(document.body);
    this._handlePhoneNumberNodes(numberNodes);
  }

  _stopObserver() {
    if (this._elemObserver) {
      this._elemObserver.disconnect();
      this._elemObserver = null;
    }
    if (this._C2DMenuObserver) {
      this._C2DMenuObserver.disconnect();
      this._C2DMenuObserver = null;
    }
  }

  _handlePhoneNumberNodes(nodes) {
    nodes.forEach((node) => {
      if (node.tagName === 'INPUT') {
        const numbers = findNumbers(node.value, { defaultCountry: this._countryCode, v2: true });
        if (numbers.length > 0) {
          this._createHoverEventListener(node);
        }
        return;
      }
      const parentNode = node.parentNode;
      if (parentNode && parentNode.tagName === RC_C2D_TAGNAME) {
        this._createHoverEventListener(parentNode);
        return;
      }
      if (isTelLinkNode(node)) {
        this._createHoverEventListener(node);
        return;
      }
      if (!node.data) {
        return;
      }
      const results = findNumbers(node.data, { defaultCountry: this._countryCode, v2: true });
      if (results.length === 0) {
        return;
      }
      const result = results[0];
      const originPhoneNumber = node.data.slice(result.startsAt, result.endsAt);
      const newTextNode = node.splitText(result.startsAt);
      newTextNode.data = newTextNode.data.substr(result.endsAt - result.startsAt);
      const el = document.createElement(RC_C2D_TAGNAME);
      el.textContent = originPhoneNumber;
      el.setAttribute(RC_C2D_ELEM_ATTRIBUTE, result['number'].number);
      parentNode.insertBefore(el, node.nextSibling);
      this._createHoverEventListener(el);
      this._handlePhoneNumberNodes([newTextNode]); // next handle loop
    });
  }

  _removeC2Dhandler(nodes) {
    nodes.forEach((node) => {
      const parentNode = node.parentNode;
      if (parentNode && parentNode.tagName === RC_C2D_TAGNAME) {
        this._cleanHoverEventListener(parentNode);
      }
      if (isTelLinkNode(node)) {
        this._cleanHoverEventListener(node);
      }
    });
  }

  _cleanHoverEventListener(node) {
    node.removeEventListener(
      'mouseenter',
      this._onC2DNumberMouseEnter
    );
    node.removeEventListener(
      'mouseleave',
      this._onC2DNumberMouseLeave
    );
    if (node.tagName === 'INPUT') {
      node.removeEventListener(
        'keydown',
        this._onC2DNumberMouseLeave
      );
    }
  }

  _createHoverEventListener(node) {
    this._cleanHoverEventListener(node);
    node.addEventListener(
      'mouseenter',
      this._onC2DNumberMouseEnter
    );
    node.addEventListener(
      'mouseleave',
      this._onC2DNumberMouseLeave
    );
    if (node.tagName === 'INPUT') {
      node.addEventListener(
        'keydown',
        this._onC2DNumberMouseLeave
      );
    }
  }

  _injectC2DMenu() {
    if (this._c2dMenuEl) {
      return;
    }
    this._c2dMenuEl = document.createElement(RC_C2D_ELEM_TAGNAME);
    this._c2dMenuEl.innerHTML = `
      <div class="rc-widget-c2d-menu-wrapper">
        <div class="rc-widget-c2d-logo">
          ${this._logoIcon}
        </div>
        <div class="rc-widget-action-icon rc-widget-c2d-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 26">
            <path fill="#0083BF" fill-rule="evenodd" stroke="#0684BD" stroke-width=".9" d="M6.656 17.651C.942 10.547.28 4.627 2.545 2.607c.592-.522 2.16-1.323 2.892-1.427.801-.14 1.602.243 2.02 1.01.802 1.636 1.777 3.238 2.788 4.805.452.697.348 1.567-.244 2.16-.349.348-.767.557-1.15.765a3.18 3.18 0 0 0-.801.523s-.105.104-.105.313c-.035.453.035 1.707 2.02 4.214 2.16 2.647 3.45 2.82 3.798 2.82.14 0 .244-.034.244-.034.244-.21.453-.453.662-.697.314-.348.593-.696 1.01-.975.697-.452 1.638-.348 2.16.21 1.325 1.323 2.753 2.576 4.112 3.76.662.557.906 1.428.557 2.16-.244.66-1.359 2.02-2.02 2.541-.558.488-1.324.697-2.195.697-3.345 0-7.7-2.925-11.637-7.8z"/>
          </svg>
        </div>
        <div class="rc-widget-c2d-separator-line"></div>
        <div class="rc-widget-action-icon rc-widget-c2sms-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 21">
            <path fill="#0684BD" fill-rule="nonzero" d="M10.944.014C4.91.014.007 4.068.007 9.316c0 2.86 1.54 5.626 4.085 7.417-.094.534-.377 1.257-1.162 2.64l-.692 1.131h1.383a6.976 6.976 0 0 0 4.84-1.917c.817.157 1.634.252 2.483.252 6.034 0 10.936-4.275 10.936-9.523 0-5.28-4.902-9.302-10.936-9.302z"/>
          </svg>
        </div>
      </div>
      <div class="rc-widget-c2d-arrow">
        <div class="rc-widget-c2d-inner-arrow"></div>
      </div>
    `;
    this._c2dMenuEl.setAttribute('class', 'rc-widget-c2d-menu');
    this._c2dMenuEl.addEventListener('mouseenter', () =>
      this._onC2DMenuMouseEnter()
    );
    this._c2dMenuEl.addEventListener('mouseleave', () =>
      this._onC2DMenuMouseLeave()
    );
    this._callBtn = this._c2dMenuEl.querySelector('.rc-widget-c2d-icon');
    this._callBtn.addEventListener('click', () => this._onCallClick());

    this._smsBtn = this._c2dMenuEl.querySelector('.rc-widget-c2sms-icon');
    this._smsBtn.addEventListener('click', () => this._onSmsClick());
    this.renderBtnTitles();
    document.body.appendChild(this._c2dMenuEl);
  }

  renderBtnTitles(callBtnTitle = this._callBtnTitle, smsBtnTitle = this._smsBtnTitle) {
    this._callBtn.setAttribute('title', callBtnTitle);
    this._smsBtn.setAttribute('title', smsBtnTitle);
  }

  _cleanC2DMenu() {
    if (this._c2dMenuEl) {
      this._callBtn = null;
      this._smsBtn = null;
      this._c2dMenuEl.remove();
      this._c2dMenuEl = null;
    }
  }

  _onC2DNumberMouseEnter = (e : any) : void => {
    if (e.rcHandled || !this._enabled) {
      return;
    }
    e.rcHandled = true;
    this._c2dNumberHover = true;
    if (e.currentTarget.tagName === 'A') {
      const telLink = e.currentTarget.href
      this._currentNumber = telLink.replace(/[^\d+*-]/g, '')
    } else if (e.currentTarget.tagName === 'INPUT') {
      this._currentNumber = e.currentTarget.value.replace(/[^\d+*-]/g, '');
    } else {
      this._currentNumber = e.currentTarget.getAttribute(RC_C2D_ELEM_ATTRIBUTE);
    }
    if (this._currentNumber) {
      const rect = e.currentTarget.getBoundingClientRect();
      this._c2dMenuEl.style.top = `${rect.top -
        (RC_C2D_MENU_HEIGHT - rect.bottom + rect.top) / 2}px`;
      this._c2dMenuLeft = window.innerWidth - rect.right < 90;
      if (this._c2dMenuLeft) {
        this._c2dMenuEl.style.left = 'inherit';
        this._c2dMenuEl.style.right = `${window.innerWidth - rect.left}px`;
      } else {
        this._c2dMenuEl.style.left = `${rect.right}px`;
        this._c2dMenuEl.style.right = 'inherit';
      }
      if (this._c2dMenuLeft) {
        this._c2dMenuEl.setAttribute('class', 'rc-widget-c2d-menu left')
      } else {
        this._c2dMenuEl.setAttribute('class', 'rc-widget-c2d-menu')
      }
      this._updateC2DMenuDisplay();
    }
  }

  _onC2DNumberMouseLeave = (e : any) : void => {
    if (e.rcHandled  || !this._enabled) {
      return;
    }
    e.rcHandled = true;
    this._c2dNumberHover = false;
    this._updateC2DMenuDisplay();
  }

  _onC2DMenuMouseEnter() {
    this._c2dMenuHover = true;
    this._updateC2DMenuDisplay();
  }

  _onC2DMenuMouseLeave() {
    this._c2dMenuHover = false;
    this._updateC2DMenuDisplay();
  }

  _updateC2DMenuDisplay() {
    if (this._c2dMenuHover || this._c2dNumberHover) {
      this._c2dMenuEl.style.display = 'block';
      return;
    }
    this._c2dMenuEl.style.display = 'none';
  }

  _onCallClick() {
    if (this._bubblePhoneNumber) {
      this._postPhoneNumberToTop(this._currentNumber, 'Call');
      return;
    }
    this._onCallClickFuncs.forEach(func => {
      func(this._currentNumber);
    });
  }

  _onSmsClick() {
    if (this._bubblePhoneNumber) {
      this._postPhoneNumberToTop(this._currentNumber, 'SMS');
      return;
    }
    this._onSmsClickFuncs.forEach(func => {
      func(this._currentNumber);
    });
  }

  onCallClick(func: (number) => void) {
    this._onCallClickFuncs.push(func);
  }

  onSmsClick(func: (number) => void) {
    this._onSmsClickFuncs.push(func);
  }

  _initIframeBubblePhoneNumberListener() {
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type !== 'rc-c2d-phone-number-bubble') {
        return;
      }
      this._currentNumber = message.phoneNumber;
      if (message.eventType === 'Call') {
        this._onCallClick();
        return;
      }
      if (message.eventType === 'SMS') {
        this._onSmsClick();
      }
    });
  }

  _postPhoneNumberToTop(phoneNumber : string, type : string) {
    window.top.postMessage({
      type: 'rc-c2d-phone-number-bubble',
      eventType: type,
      phoneNumber,
    }, '*');
  }

  dispose() {
    this._enabled = false;
    this._stopObserver();
    this._cleanC2DMenu();
  }

  start() {
    this._enabled = true;
    this._initObserver();
    this._injectC2DMenu();
  }
}
