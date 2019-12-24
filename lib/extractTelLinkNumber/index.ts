import { extractPhoneNumber } from '../extractPhoneNumber';

export const hrefRegExp = /^(tel|callto|sms):(.*)$/i;

export function getHref(node: Element): string {
  try {
    return decodeURIComponent(node.getAttribute('href'));
  } catch (e) {
    console.error(e);
    return '';
  }
}

export function extractTelLinkNumber(node: Element): string {
  const match =
    (node && node.tagName === 'A' && hrefRegExp.exec(getHref(node))) || null;
  if (match) {
    return extractPhoneNumber(match[2]);
  }
  return null;
}
