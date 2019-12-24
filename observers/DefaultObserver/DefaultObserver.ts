import { forEach, reduce } from 'ramda';
import { NodeType } from '../../lib/nodeType';
import { RC_C2D_NUMBER_TAGNAME } from '../../lib/constants';
import { IMatcher, MatchModel } from '../../matchers/Matcher.interface';
import { C2DEvents } from '../../lib/C2DEvents';
import { IObserver, ObserverProps } from '../Observer.interface';
import { Emitter } from '../../lib/Emitter';
import { RegExpPhoneNumberMatcher } from '../../matchers/RegExpPhoneNumberMatcher';

export const C2D_CONTEXT_ATTRIBUTE: string = 'DATA-C2D-CONTEXT';

export const DEFAULT_OBSERVER_OPTIONS: MutationObserverInit = {
  attributeFilter: ['href'],
  attributes: true,
  subtree: true,
  childList: true,
  characterData: true,
};

export interface DefaultObserverProps extends ObserverProps {}

export class DefaultObserver extends Emitter implements IObserver {
  private _observingNode: Node;
  private _isObserving: boolean = false;
  private _observer: MutationObserver;
  private _observerOptions: MutationObserverInit;
  private _matcher: IMatcher;

  constructor({
    node = document.body,
    observerOptions = DEFAULT_OBSERVER_OPTIONS,
    matcher = new RegExpPhoneNumberMatcher(),
  }: DefaultObserverProps = {}) {
    super();

    this._observingNode = node;
    this._observerOptions = observerOptions;
    this._matcher = matcher;

    this._observer = new MutationObserver(this._onElementMutations);
    this._injectMatches(this._processNodes(node, false));
    this._startObserver();
  }

  dispose() {
    if (this._observer) {
      this._stopObserver();
      this._observer = null;
    }
    if (this._observingNode) {
      this._cleanWraps(this._observingNode);
      this._observingNode = null;
    }
    super.dispose();
  }

  private _cleanWraps(node: Node, children: boolean = true) {
    if (node && node.nodeType === NodeType.ELEMENT_NODE) {
      const element = node as Element;
      // search
      let wrappedElements: Element[] = [];
      if (element.getAttribute(C2D_CONTEXT_ATTRIBUTE)) {
        wrappedElements.push(element);
      }
      if (children && element.hasChildNodes()) {
        const els = element.querySelectorAll(`[${C2D_CONTEXT_ATTRIBUTE}]`);
        if (els.length) {
          wrappedElements = wrappedElements.concat(Array.from(els));
        }
      }
      // strip
      forEach((el) => {
        this._removeMouseEvents(el);
        el.removeAttribute(C2D_CONTEXT_ATTRIBUTE);
        if (el.tagName === RC_C2D_NUMBER_TAGNAME) {
          el.replaceWith(el.textContent);
        }
      }, wrappedElements);
    }
  }

  private _startObserver() {
    if (!this._isObserving) {
      this._isObserving = true;
      this._observer.observe(this._observingNode, this._observerOptions);
    }
  }

  private _stopObserver() {
    if (this._observer && this._isObserving) {
      this._observer.disconnect();
      this._isObserving = false;
    }
  }

  /**
   * @description
   * This function handles all the dom mutations observed with MutationOberserver.
   * It is important that these mutations are process within the same event loop
   * with a synchronous function, because if these mutations are delegated to
   * a new event loop via setTimout, by the time these mutations are processed, the
   * actual dom structure may have been changed.
   * @param {Object} mutations
   */
  private _onElementMutations = (mutations: MutationRecord[]) => {
    // c2d
    const changeSet = reduce(
      (result, mutation) => {
        reduce(
          (result, node) => {
            result.newNodes.add(node);
            return result;
          },
          result,
          Array.from(mutation.addedNodes),
        );
        if (
          mutation.type === 'characterData' ||
          mutation.type === 'attributes'
        ) {
          const node = mutation.target;
          if (node) {
            result.changedNodes.add(node);
          }
        }
        reduce(
          (result, node) => {
            if (node) {
              result.removedNodes.add(node);
            }
            return result;
          },
          result,
          Array.from(mutation.removedNodes),
        );
        return result;
      },
      {
        newNodes: new Set<Node>(),
        changedNodes: new Set<Node>(),
        removedNodes: new Set<Node>(),
      },
      Array.from(mutations),
    );

    // stop the observer so that it won't pick up the dom mutation caused by our own injections
    this._stopObserver();

    // removed nodes
    forEach((node) => {
      this._cleanWraps(node);
    }, Array.from(changeSet.removedNodes));

    // changed nodes
    forEach((node) => {
      this._cleanWraps(node);
    }, Array.from(changeSet.changedNodes));
    const changedMatches = this._processNodes(
      Array.from(changeSet.changedNodes),
      true,
    );
    this._injectMatches(changedMatches);

    // new nodes
    const newMatches = this._processNodes(Array.from(changeSet.newNodes), true);
    this._injectMatches(newMatches);

    // restart the observer. Because this is a synchronous function, no other script should
    // run during the time that the observer is off.
    this._startObserver();
  };

  private _injectMatches(matches: MatchModel[]) {
    if (!matches) {
      return;
    }
    // reverse for "splitText" from last
    matches.reverse();
    // loop
    forEach((item) => {
      // not yet supported
      if (item.startsNode !== item.endsNode) {
        return;
      }
      if (
        item.startsNode.parentElement &&
        item.startsNode.parentElement.tagName === RC_C2D_NUMBER_TAGNAME
      ) {
        // deal with the case that parentNode lost c2d dial attribute
        const parentEl = item.startsNode.parentElement;
        this._setContext(parentEl, item.context);
        // reset the listeners in case the content editable rebuild the dom structure
        this._removeMouseEvents(parentEl);
        this._addMouseEvents(parentEl);
        return;
      }
      if (item.startsNode.nodeType === NodeType.ELEMENT_NODE) {
        const element = item.startsNode as Element;
        this._setContext(element, item.context);
        this._removeMouseEvents(element);
        this._addMouseEvents(element);
        return;
      }
      if (
        item.startsNode.parentNode &&
        item.startsNode.nodeType === NodeType.TEXT_NODE
      ) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Text/splitText
        // splitText destroy the startsAt/endsAt values, for keepping the offsets correct
        // it requires to split text from last, so we need to reverse matches
        const textNode = item.startsNode as Text;
        const textToWrap = textNode.data.substring(item.startsAt, item.endsAt);
        // split
        textNode.splitText(item.endsAt);
        const matchedNode = textNode.splitText(item.startsAt);
        // wrap
        const wrappedNode = document.createElement(RC_C2D_NUMBER_TAGNAME);
        wrappedNode.textContent = textToWrap;
        // replace
        item.startsNode.parentNode.insertBefore(wrappedNode, matchedNode);
        matchedNode.parentNode.removeChild(matchedNode);
        // setup
        this._setContext(wrappedNode, item.context);
        this._addMouseEvents(wrappedNode);
      }
    }, matches);
  }

  private _setContext(node: Element, context: any) {
    node.setAttribute(C2D_CONTEXT_ATTRIBUTE, JSON.stringify(context || ''));
  }

  private _getContext(node: Element) {
    const contextJson = node.getAttribute(C2D_CONTEXT_ATTRIBUTE);
    const context = JSON.parse(contextJson);
    return context;
  }

  private _addMouseEvents(node: Element) {
    node.addEventListener('mouseenter', this._onMouseEnter);
    node.addEventListener('mouseleave', this._onMouseLeave);
  }

  private _removeMouseEvents(node: Element) {
    node.removeEventListener('mouseenter', this._onMouseEnter);
    node.removeEventListener('mouseleave', this._onMouseLeave);
  }

  private _onMouseEnter = (ev: MouseEvent): void => {
    if (!this.disposed) {
      const target = ev.currentTarget as Element;
      const context = this._getContext(target);
      this._emitter.emit(C2DEvents.hoverIn, {
        target,
        context,
      });
    }
  };

  private _onMouseLeave = (ev: MouseEvent): void => {
    if (!this.disposed) {
      const target = ev.currentTarget as Element;
      this._emitter.emit(C2DEvents.hoverOut, { target });
    }
  };

  private _processNodes(node: Node | Node[], validate: boolean): MatchModel[] {
    let results: MatchModel[] = [];
    const nodes: Node[] = [].concat(node);
    forEach((n) => {
      const matches = this._matcher.match({
        node: n,
        validate,
      });
      if (matches && matches.length) {
        results = results.concat(matches);
      }
    }, nodes);
    return results;
  }
}
