import { RC_C2D_NUMBER_TAGNAME } from '../../lib/constants';
import { extractMeetingLink } from '../../lib/extractMeetingLink';
import { extractPhoneNumber } from '../../lib/extractPhoneNumber';
import { extractTelLinkNumber } from '../../lib/extractTelLinkNumber';
import { NodeType } from '../../lib/nodeType';
import type { MatchModel } from '../Matcher.interface';

interface MatchOptions {
  isValidNode(node: Node): boolean;
}

interface AccumulatorOptions extends MatchOptions {
  result: Set<MatchModel>;
}

function traverseTextNode(
  result: Set<MatchModel>,
  node: CharacterData,
  offset: number,
) {
  const text = node.data.substring(offset);
  if (!text.length) {
    return;
  }
  // meeting link should be skipped
  const meetingLink = extractMeetingLink(text);
  if (meetingLink) {
    const startsAt = offset + text.indexOf(meetingLink);
    const endsAt = startsAt + meetingLink.length;
    traverseTextNode(result, node, endsAt);
    return;
  }
  const phoneNumber = extractPhoneNumber(text);
  if (phoneNumber) {
    const startsAt = offset + text.indexOf(phoneNumber);
    const endsAt = startsAt + phoneNumber.length;
    result.add({
      startsNode: node,
      endsNode: node,
      startsAt,
      endsAt,
      context: {
        phoneNumber,
      },
    });
    traverseTextNode(result, node, endsAt);
  }
}

export function traverseNode(accumulator: AccumulatorOptions, node: Node) {
  const { isValidNode, result } = accumulator;
  if (
    isValidNode &&
    node.nodeType === NodeType.ELEMENT_NODE &&
    isValidNode(node)
  ) {
    const phoneNumber = extractTelLinkNumber(node as Element);
    if (phoneNumber) {
      result.add({
        startsNode: node,
        endsNode: node,
        context: { phoneNumber },
      });
    } else {
      Array.from(node.childNodes).reduce(traverseNode, accumulator);
    }
  } else if (node.nodeType === NodeType.TEXT_NODE) {
    if (
      node.parentElement &&
      node.parentElement.tagName === RC_C2D_NUMBER_TAGNAME
    ) {
      const textContent = node.parentElement.innerText;
      const phoneNumber = extractPhoneNumber(textContent);
      if (phoneNumber) {
        result.add({
          startsNode: node,
          endsNode: node,
          context: { phoneNumber },
        });
      }
    } else {
      traverseTextNode(result, node as CharacterData, 0);
    }
  }
  return accumulator;
}
