import { Emitter } from '../../lib/Emitter';
import { RC_C2D_NUMBER_TAGNAME } from '../../lib/constants';
import { NodeType } from '../../lib/nodeType';
import {
  RegExpPhoneNumberMatcher,
  type IMatcher,
  type MatchModel,
} from '../../matchers';
import type {
  IObserver,
  ObserverEventArg,
  ObserverProps,
} from '../Observer.interface';
import { ObserverEvents } from '../ObserverEvents';

export const C2D_CONTEXT_ATTRIBUTE = 'DATA-C2D-CONTEXT';

const DEFAULT_OBSERVER_OPTIONS: MutationObserverInit = {
  attributeFilter: ['href'],
  attributes: true,
  subtree: true,
  childList: true,
  characterData: true,
};

export interface WrapperObserverProps extends ObserverProps {}

export class WrapperObserver extends Emitter implements IObserver {
  private _observingNode?: Node;
  private _isObserving = false;
  private _observer?: MutationObserver;
  private _observerOptions: MutationObserverInit;
  private _matcher: IMatcher;

  constructor({
    node = document.body,
    observerOptions = DEFAULT_OBSERVER_OPTIONS,
    matcher = new RegExpPhoneNumberMatcher(),
  }: WrapperObserverProps = {}) {
    super();

    this._observingNode = node;
    this._observerOptions = observerOptions;
    this._matcher = matcher;

    this._observer = new MutationObserver(this._onElementMutations);
    this._injectMatches(this._processNodes(node, false));
    this._startObserver();
  }

  override dispose() {
    if (this._observer) {
      this._stopObserver();
      this._observer = undefined;
    }
    if (this._observingNode) {
      this._cleanWraps(this._observingNode);
      this._observingNode = undefined;
    }
    super.dispose();
  }

  private _cleanWraps(node: Node, children = true) {
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
      wrappedElements.forEach((el) => {
        this._removeMouseEvents(el);
        el.removeAttribute(C2D_CONTEXT_ATTRIBUTE);
        if (el.tagName === RC_C2D_NUMBER_TAGNAME && el.textContent) {
          el.replaceWith(el.textContent);
        }
      });
    }
  }

  private _startObserver() {
    if (!this._isObserving) {
      this._isObserving = true;
      if (this._observer && this._observingNode) {
        this._observer.observe(this._observingNode, this._observerOptions);
      }
    }
  }

  private _stopObserver() {
    if (this._isObserving) {
      this._isObserving = false;
      if (this._observer) {
        this._observer.disconnect();
      }
    }
  }

  /**
   * @description
   * This function handles all the dom mutations observed with MutationObserver.
   * It is important that these mutations are process within the same event loop
   * with a synchronous function, because if these mutations are delegated to
   * a new event loop via setTimeout, by the time these mutations are processed, the
   * actual dom structure may have been changed.
   * @param {Object} mutations
   */
  private _onElementMutations = (mutations: MutationRecord[]) => {
    // c2d
    const changeSet = Array.from(mutations).reduce(
      (result, mutation) => {
        Array.from(mutation.addedNodes).reduce((result, node) => {
          result.newNodes.add(node);
          return result;
        }, result);
        if (
          mutation.type === 'characterData' ||
          mutation.type === 'attributes'
        ) {
          const node = mutation.target;
          if (node) {
            result.changedNodes.add(node);
          }
        }
        Array.from(mutation.removedNodes).reduce((result, node) => {
          if (node) {
            result.removedNodes.add(node);
          }
          return result;
        }, result);
        return result;
      },
      {
        newNodes: new Set<Node>(),
        changedNodes: new Set<Node>(),
        removedNodes: new Set<Node>(),
      },
    );

    // stop the observer so that it won't pick up the dom mutation caused by our own injections
    this._stopObserver();

    // removed nodes
    Array.from(changeSet.removedNodes).forEach((node) => {
      this._cleanWraps(node);
    });

    // changed nodes
    Array.from(changeSet.changedNodes).forEach((node) => {
      this._cleanWraps(node);
    });
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
    matches.forEach((item) => {
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
        // splitText destroy the startsAt/endsAt values, for keeping the offsets correct
        // it requires to split text from last, so we need to reverse matches
        const textNode = item.startsNode as Text;
        const textToWrap = textNode.data.substring(item.startsAt!, item.endsAt);
        // split
        if (item.endsAt && item.endsAt > 0) {
          textNode.splitText(item.endsAt);
        }
        let matchedNode = textNode;
        if (item.startsAt && item.startsAt > 0) {
          matchedNode = textNode.splitText(item.startsAt);
        }
        // wrap
        const wrappedNode = document.createElement(RC_C2D_NUMBER_TAGNAME);
        wrappedNode.textContent = textToWrap;
        // replace
        item.startsNode.parentNode.insertBefore(wrappedNode, matchedNode);
        matchedNode.parentNode!.removeChild(matchedNode);
        // setup
        this._setContext(wrappedNode, item.context);
        this._addMouseEvents(wrappedNode);
      }
    });
  }

  private _setContext(node: Element, context: any) {
    node.setAttribute(C2D_CONTEXT_ATTRIBUTE, JSON.stringify(context || ''));
  }

  private _getContext(node: Element) {
    const contextJson = node.getAttribute(C2D_CONTEXT_ATTRIBUTE);
    if (!contextJson) {
      return undefined;
    }

    const context = JSON.parse(contextJson);
    return context;
  }

  private _addMouseEvents(node: Element) {
    node.addEventListener('click', this._onClick);
    node.addEventListener('mouseenter', this._onMouseEnter);
    node.addEventListener('mouseleave', this._onMouseLeave);
  }

  private _removeMouseEvents(node: Element) {
    node.removeEventListener('click', this._onClick);
    node.removeEventListener('mouseenter', this._onMouseEnter);
    node.removeEventListener('mouseleave', this._onMouseLeave);
  }

  private _onClick = (ev: Event) => {
    if (!this.disposed) {
      const target = ev.currentTarget as Element;
      const context = this._getContext(target);
      this.emit(ObserverEvents.click, {
        target,
        rect: target.getBoundingClientRect(),
        context,
      } satisfies ObserverEventArg);
    }
  };

  private _onMouseEnter = (ev: Event) => {
    if (!this.disposed) {
      const target = ev.currentTarget as Element;
      const context = this._getContext(target);
      this.emit(ObserverEvents.hoverIn, {
        target,
        rect: target.getBoundingClientRect(),
        context,
      } satisfies ObserverEventArg);
    }
  };

  private _onMouseLeave = (ev: Event) => {
    if (!this.disposed) {
      const target = ev.currentTarget as Element;
      this.emit(ObserverEvents.hoverOut, { target });
    }
  };

  private _processNodes(node: Node | Node[], validate: boolean): MatchModel[] {
    let results: MatchModel[] = [];
    const nodes = Array.isArray(node) ? node : [node];
    nodes.forEach((n) => {
      const matches = this._matcher.match({
        node: n,
        validate,
      });
      if (matches && matches.length) {
        results = results.concat(matches);
      }
    });
    return results;
  }
}
