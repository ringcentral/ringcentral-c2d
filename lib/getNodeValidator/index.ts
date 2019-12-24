import { map, reduce, find } from 'ramda';
import { wildcardToRegExp } from '../wildcardToRegExp';

/**
 * Each object define an exclusion, all the criteria from an exclusion must match
 * to declare a node invalid so each criteria is && together
 */
export const defaultExclusions = [
  { tagName: 'noscript' },
  { tagName: 'option' },
  { tagName: 'script' },
  { tagName: 'style' },
  { tagName: 'textarea' },
  { tagName: 'input' },
  { tagName: 'text' }, // svg text element
  {
    attributes: [
      {
        name: 'contenteditable',
        value: 'true',
      },
    ],
  },
  {
    description: 'move-to dropdown in gmail',
    url: '*://mail.google.com/*',
    classList: ['J-M', 'agd', 'aYO', 'jQjAxd', 'aX2'],
    tagName: 'div',
  },
];

export const defaultInclusions = [
  {
    description: 'Google Sheets support',
    url: '*://docs.google.com/spreadsheets/*',
  },
];

/**
 * Normalize an exclusion to turn wildcard url into regexp and to make sure
 * tagNames are in uppercase
 * @param {Object} exclusion
 */
function compileConditions(conditions) {
  return {
    ...conditions,
    url: conditions.url && wildcardToRegExp(conditions.url),
    tagName: conditions.tagName && conditions.tagName.toUpperCase(),
  };
}

function matchUrl(url) {
  return url ? url.test(window.location.href) : true;
}

function matchTagName(node, tagName) {
  return tagName ? tagName === (node.tagName || '').toUpperCase() : true;
}

function matchClasses(node, classList) {
  return classList
    ? node.classList &&
        !find((className) => !node.classList.contains(className), classList)
    : true;
}

function matchAttributes(node: any, attributes: any[]) {
  return attributes
    ? node.getAttribute &&
        !find((entry) => {
          if (entry.value instanceof RegExp) {
            return !entry.value.test(node.getAttribute(entry.name));
          }
          return node.getAttribute(entry.name) !== entry.value;
        }, attributes)
    : true;
}

function matchExecFunction(node, execute) {
  return execute ? execute(node) : true;
}

function matchReducer(accumulator, descriptor) {
  if (!accumulator.match) {
    const { url, tagName, classList, attributes, matchFunc } = descriptor;
    const { node } = accumulator;
    if (
      matchUrl(url) &&
      matchTagName(node, tagName) &&
      matchClasses(node, classList) &&
      matchAttributes(node, attributes) &&
      matchExecFunction(node, matchFunc)
    ) {
      accumulator.match = descriptor;
    }
  }
  return accumulator;
}

/**
 * Find a matching exclusion against the node.
 * @param {DOMNode} node
 * @param {Array<Object>} exclusions
 */
function matchDescriptors(node, descriptors) {
  return (
    reduce(
      matchReducer,
      {
        node,
      },
      descriptors,
    ).match || null
  );
}

export interface NodeValidator {
  (node: Node): boolean;
}

export function getNodeValidator(
  exclusions = defaultExclusions,
  inclusions = defaultInclusions,
): NodeValidator {
  const compiledExclusions = map(compileConditions, exclusions);
  const compiledInclusions = map(compileConditions, inclusions);
  return function isValidNode(node: Node): boolean {
    return !(
      (node instanceof HTMLElement && node.hidden) ||
      (matchDescriptors(node, compiledExclusions) &&
        !matchDescriptors(node, compiledInclusions))
    );
  };
}
