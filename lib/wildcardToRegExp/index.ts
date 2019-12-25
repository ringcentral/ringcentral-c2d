import { escapeRegExp } from '../escapeRegExp';

export function wildcardToRegExp(
  pattern: string = '',
  wildcardChar: string = '*',
): RegExp {
  const escapedTokens = pattern.split(wildcardChar).map((s) => escapeRegExp(s));
  return new RegExp(`^${escapedTokens.join('.*')}$`);
}
