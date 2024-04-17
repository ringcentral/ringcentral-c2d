import { type MatchRect } from '../../lib/NodeObserver';
import { BaseWidget } from '../BaseWidget';
import { type IWidget, type TargetItem } from '../Widget.interface';

export class SampleWidget extends BaseWidget implements IWidget {
  _rootEl?: HTMLElement;
  _widgetHovering = false;
  _currentlyHovering = false;
  _currentTargetItem?: TargetItem;

  constructor() {
    super();
    this._injectDOM();
  }

  setTarget(item?: TargetItem) {
    this._currentlyHovering = !!item;
    this._updateDisplay();
    if (item) {
      this._currentTargetItem = item;
      this._showAt(item.rect);
    }
  }

  _showAt(rect: MatchRect) {
    if (!this._rootEl) return;
    // Any way to show your widget at the right position
    const left = rect.left + rect.width;
    this._rootEl.style.transform = `translate(${left}px, ${rect.top}px)`;
  }

  _updateDisplay() {
    if (!this._rootEl) return;
    // Any way to show/hide your widget
    this._rootEl.style.display =
      this._currentlyHovering || this._widgetHovering ? 'block' : 'none';
  }

  _injectDOM() {
    // Any way create your own elements
    this._rootEl = document.createElement('div');
    document.body.appendChild(this._rootEl);
    this._rootEl.style.cssText =
      'display: none; position: fixed; left: 0; top: 0; background: #ccc; padding: 10px;';
    this._rootEl.innerHTML = `
      <div>
        <button type="button" data-func="func1">Button 1</button>
        <button type="button" data-func="func2">Button 2</button>
      </div>
    `;
    this._rootEl.addEventListener('mouseenter', () => {
      this._widgetHovering = true;
      this._updateDisplay();
    });
    this._rootEl.addEventListener('mouseleave', () => {
      this._widgetHovering = false;
      this._updateDisplay();
    });

    // Any way bind events as you need
    const button1 = this._rootEl.querySelector('[data-func="func1"]')!;
    const button2 = this._rootEl.querySelector('[data-func="func2"]')!;
    button1.addEventListener('click', () => {
      this.emit('func1', this._currentTargetItem);
      console.log('click func1');
    });
    button2.addEventListener('click', () => {
      this.emit('func2', this._currentTargetItem);
      console.log('click func2');
    });
  }
}
