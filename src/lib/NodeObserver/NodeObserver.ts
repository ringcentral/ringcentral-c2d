import type {
  INodeObserver,
  NodeObserverProps,
} from './NodeObserver.interface';
import type { IRangeMatch } from './RangeMatch';
import { upFirstValueNode } from './utilities';

export const DEFAULT_OBSERVER_OPTIONS: MutationObserverInit = {
  attributeFilter: ['href'],
  attributes: true,
  subtree: true,
  childList: true,
  characterData: true,
};

export class DefaultNodeObserver implements INodeObserver {
  private _currentRoot?: Node;
  private _mutationObserver?: MutationObserver;
  private _linkedMap: Map<Node, Element>;
  private _matchesMap: Map<Element, IRangeMatch[]>;

  constructor(private _props: NodeObserverProps) {
    if (!this._props.matcher) {
      throw new Error('[matcher] is required');
    }
    this._linkedMap = new Map<Node, Element>();
    this._matchesMap = new Map<Element, IRangeMatch[]>();
  }

  observe(node: Node) {
    if (this._currentRoot) {
      throw new Error('Node Observer is Running');
    }
    this._currentRoot = node;
    this._observeMutation(node);
    this.searchMatches(node);
  }

  searchMatches(node: Node) {
    if (!node) {
      throw new Error('[node] is required');
    }
    const matched = this._props.matcher(node);
    if (matched) {
      for (const match of matched) {
        this.addMatch(match);
      }
    }
  }

  addMatch(match: IRangeMatch) {
    if (!match) {
      throw new Error('[match] is required');
    }
    // get target
    const target = match.getAncestorContainer();
    if (!target) {
      return null;
    }
    // setup link
    this._linkedMap.set(match.startsNode, target);
    this._linkedMap.set(match.endsNode, target);
    // cache matches
    const matches = this._matchesMap.get(target) || [];
    matches.push(match); // TODO: duplicate risk
    this._matchesMap.set(target, matches);
  }

  removeMatch(match: IRangeMatch) {
    if (!match) {
      throw new Error('[match] is required');
    }
    // get target
    const target = match.getAncestorContainer();
    if (!target) {
      return;
    }
    // get matches
    let matches = this._matchesMap.get(target);
    if (matches) {
      // exclude
      matches = matches.filter((x) => x !== match);
      // unlink
      if (!matches.some((x) => x.involves(match.startsNode))) {
        this._linkedMap.delete(match.startsNode);
      }
      if (!matches.some((x) => x.involves(match.endsNode))) {
        this._linkedMap.delete(match.endsNode);
      }
      // update
      if (matches.length) {
        this._matchesMap.set(target, matches);
      } else {
        this._matchesMap.delete(target);
      }
      // explicit dispose
      match.dispose();
    }
  }

  private _findAndRemoveMatches(node: Node) {
    const linkedElement = this._linkedMap.get(node);
    if (linkedElement) {
      const matches = this._matchesMap.get(linkedElement);
      if (matches) {
        for (const match of matches) {
          if (match.involves(node)) {
            this.removeMatch(match);
          }
        }
      }
    }
  }

  stripMatches(node: Node, children = true) {
    if (!node) {
      throw new Error('[node] is required');
    }
    // when strip the root node it means to strip all the matched
    // so just strip all the matched instead of walking through the DOM
    if (node === this._currentRoot) {
      const allMatches = Array.from(this._matchesMap.values());
      for (const matches of allMatches) {
        for (const match of matches) {
          this.removeMatch(match);
        }
      }
      return;
    }
    // strip single node
    if (!children) {
      this._findAndRemoveMatches(node);
      return;
    }
    // strip the specified node tree
    const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ALL);
    let current: Node | null = treeWalker.currentNode;
    while (current) {
      this._findAndRemoveMatches(current);
      current = treeWalker.nextNode();
    }
  }

  private _observeMutation(node: Node) {
    this._mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        switch (mutation.type) {
          // text node data change goes this path
          case 'characterData': {
            // 'target' is always a text node
            const valueNode = mutation.target.parentNode
              ? upFirstValueNode(mutation.target.parentNode)
              : null;
            if (valueNode) {
              this.stripMatches(valueNode);
              this.searchMatches(valueNode);
            } else {
              this.stripMatches(mutation.target, false);
              this.searchMatches(mutation.target);
            }
            break;
          }

          // attribute add/remove/change goes this path
          case 'attributes': {
            // 'target' is always an element
            const valueNode = mutation.target.parentNode
              ? upFirstValueNode(mutation.target.parentNode)
              : null;
            if (valueNode) {
              this.stripMatches(valueNode);
              this.searchMatches(valueNode);
            } else {
              this.stripMatches(mutation.target, false);
              this.searchMatches(mutation.target);
            }
            break;
          }

          // any node add/remove goes this path
          case 'childList': {
            // 'target' is the parent of node being removed/added
            const valueNode = upFirstValueNode(mutation.target);
            if (valueNode) {
              this.stripMatches(valueNode);
              this.searchMatches(valueNode);
            } else {
              mutation.removedNodes.forEach((node) => {
                this.stripMatches(node);
              });
              mutation.addedNodes.forEach((node) => {
                this.searchMatches(node);
              });
            }
            break;
          }

          default:
            break;
        }
      }
    });
    const options = this._props.observerOptions || DEFAULT_OBSERVER_OPTIONS;
    this._mutationObserver.observe(node, options);
  }

  disconnect() {
    if (this._mutationObserver) {
      this._mutationObserver.disconnect();
    }
    if (this._currentRoot) {
      this.stripMatches(this._currentRoot);
      this._currentRoot = undefined;
    }
    this._linkedMap.clear();
    this._matchesMap.clear();
  }
}
