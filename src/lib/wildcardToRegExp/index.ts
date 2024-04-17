import { escapeRegExp } from '../escapeRegExp';

export function wildcardToRegExp(pattern = '', wildcardChar = '*'): RegExp {
  const escapedTokens = pattern.split(wildcardChar).map((s) => escapeRegExp(s));
  return new RegExp(`^${escapedTokens.join('.*')}$`);
}
