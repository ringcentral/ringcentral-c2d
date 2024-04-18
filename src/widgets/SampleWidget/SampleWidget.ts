import { type MatchRect } from '../../lib/NodeObserver';
import { BaseWidget } from '../BaseWidget';
import { type IWidget, type TargetItem } from '../Widget.interface';

export class SampleWidget extends BaseWidget implements IWidget {
  _rootElement?: HTMLElement;
  _widgetHovering = false;
  _targetHovering = false;
  _currentTarget?: TargetItem;

  constructor() {
    super();
    this._injectDOM();
  }

  // IWidget interface member
  setTarget(item?: TargetItem) {
    this._targetHovering = !!item;
    this._updateDisplay();
    if (item) {
      this._currentTarget = item;
      this._updatePosition(item.rect);
    }
  }

  _updatePosition(rect: MatchRect) {
    // Any way to put your widget at the right position
    if (!this._rootElement) return;
    const left = rect.left + rect.width;
    this._rootElement.style.transform = `translate(${left}px, ${rect.top}px)`;
  }

  _updateDisplay() {
    // Any way to show/hide your widget
    if (!this._rootElement) return;
    this._rootElement.style.display =
      this._targetHovering || this._widgetHovering ? 'block' : 'none';
  }

  _injectDOM() {
    // Any way create your own elements
    this._rootElement = document.createElement('div');
    document.body.appendChild(this._rootElement);
    this._rootElement.style.cssText =
      'display: none; position: fixed; left: 0; top: 0; background: #ccc; padding: 10px;';
    this._rootElement.innerHTML = `
      <div>
        <button type="button" data-func="func1">Button 1</button>
        <button type="button" data-func="func2">Button 2</button>
      </div>
    `;
    this._rootElement.addEventListener('mouseenter', () => {
      this._widgetHovering = true;
      this._updateDisplay();
    });
    this._rootElement.addEventListener('mouseleave', () => {
      this._widgetHovering = false;
      this._updateDisplay();
    });

    // Any way bind/emit any events as you need
    const button1 = this._rootElement.querySelector('[data-func="func1"]')!;
    const button2 = this._rootElement.querySelector('[data-func="func2"]')!;
    button1.addEventListener('click', () => {
      this.emit('func1', this._currentTarget);
      console.log('click func1', this._currentTarget);
    });
    button2.addEventListener('click', () => {
      this.emit('func2', this._currentTarget);
      console.log('click func2', this._currentTarget);
    });
  }
}
