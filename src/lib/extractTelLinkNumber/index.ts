import { extractPhoneNumber } from '../extractPhoneNumber';

export const hrefRegExp = /^(tel|callto|sms):(.*)$/i;

export function getHref(node: Element): string {
  try {
    const href = node.getAttribute('href');
    if (href) {
      return decodeURIComponent(href);
    }
  } catch (e) {
    // ignore
  }
  return '';
}

export function extractTelLinkNumber(node: Element) {
  const match =
    (node && node.tagName === 'A' && hrefRegExp.exec(getHref(node))) || null;
  if (match) {
    return extractPhoneNumber(match[2]);
  }
}
