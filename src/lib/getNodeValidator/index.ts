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
function compileConditions(
  conditions: Partial<(typeof defaultExclusions)[number]>,
) {
  return {
    ...conditions,
    url: conditions.url && wildcardToRegExp(conditions.url),
    tagName: conditions.tagName && conditions.tagName.toUpperCase(),
  };
}

function matchUrl(url: RegExp | undefined) {
  return url ? url.test(window.location.href) : true;
}

function matchTagName(node: HTMLElement, tagName: string | undefined) {
  return tagName ? tagName === (node.tagName || '').toUpperCase() : true;
}

function matchClasses(node: HTMLElement, classList: string[]) {
  return classList
    ? node.classList &&
        !classList.find(
          (className: string) => !node.classList.contains(className),
        )
    : true;
}

function matchAttributes(node: any, attributes: any[]) {
  return attributes
    ? node.getAttribute &&
        !attributes.find((entry) => {
          if (entry.value instanceof RegExp) {
            return !entry.value.test(node.getAttribute(entry.name));
          }
          return node.getAttribute(entry.name) !== entry.value;
        })
    : true;
}

function matchExecFunction(
  node: HTMLElement,
  execute: (node: HTMLElement) => boolean,
) {
  return execute ? execute(node) : true;
}

function matchReducer(
  accumulator: { node: HTMLElement; match?: HTMLElement },
  descriptor: any,
) {
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
function matchDescriptors(
  node: Node,
  descriptors: ReturnType<typeof compileConditions>[],
) {
  return (
    descriptors.reduce(matchReducer, {
      node: node as HTMLElement,
    }).match || null
  );
}

export interface NodeValidator {
  (node: Node): boolean;
}

export function getNodeValidator(
  exclusions = defaultExclusions,
  inclusions = defaultInclusions,
): NodeValidator {
  const compiledExclusions = exclusions.map(compileConditions);
  const compiledInclusions = inclusions.map(compileConditions);
  return function isValidNode(node: Node): boolean {
    return !(
      (node instanceof HTMLElement && node.hidden) ||
      (matchDescriptors(node, compiledExclusions) &&
        !matchDescriptors(node, compiledInclusions))
    );
  };
}
