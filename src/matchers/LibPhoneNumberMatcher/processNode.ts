import { isValueNode } from '../../lib/NodeObserver/utilities';
import { RC_C2D_NUMBER_TAGNAME } from '../../lib/constants';
import { getHref, hrefRegExp } from '../../lib/extractTelLinkNumber';
import { NodeType } from '../../lib/nodeType';
import type { MatchModel } from '../Matcher.interface';

const includeValueNodes = false;

export function isAnchorNode(node: Element): boolean {
  return node.tagName === 'A' && hrefRegExp.test(getHref(node));
}

export function isC2dNumberNode(node: Element): boolean {
  return node.tagName === RC_C2D_NUMBER_TAGNAME;
}

export function processNode(
  node: Node,
  detector: (value: string) => any[],
): MatchModel[] {
  const matches: MatchModel[] = [];
  if (node.nodeType === NodeType.ELEMENT_NODE) {
    const element = node as HTMLElement;
    if (isValueNode(element) && includeValueNodes) {
      const valueElement = element as HTMLInputElement;
      const items = detector(valueElement.value);
      for (const item of items) {
        matches.push({
          startsNode: valueElement,
          endsNode: valueElement,
          startsAt: item.startsAt,
          endsAt: item.endsAt,
          context: {
            phoneNumber: item.phoneNumber,
            country: item.country,
            ext: item.ext,
          },
        });
      }
    } else if (isAnchorNode(element)) {
      const anchorElement = element as HTMLAnchorElement;
      const items = detector(getHref(anchorElement));
      if (items.length) {
        matches.push({
          startsNode: anchorElement,
          endsNode: anchorElement,
          context: {
            phoneNumber: items[0].phoneNumber,
            country: items[0].country,
            ext: items[0].ext,
          },
        });
      }
    } else if (isC2dNumberNode(element)) {
      const innerText = element.innerText;
      matches.push({
        startsNode: element,
        endsNode: element,
        context: {
          phoneNumber: innerText,
        },
      });
    }
  } else if (node.nodeType === NodeType.TEXT_NODE) {
    const textNode = node as Text;
    let offset = 0;
    let text = textNode.data.substring(offset);
    while (text.length) {
      const items = detector(text);
      if (!items || !items.length) {
        break;
      }
      for (const item of items) {
        matches.push({
          startsNode: textNode,
          endsNode: textNode,
          startsAt: offset + item.startsAt,
          endsAt: offset + item.endsAt,
          context: {
            phoneNumber: item.phoneNumber,
            country: item.country,
            ext: item.ext,
          },
        });
      }
      const lastItem = items[items.length - 1];
      offset += lastItem.endsAt;
      text = textNode.data.substring(offset);
    }
  }
  return matches;
}
