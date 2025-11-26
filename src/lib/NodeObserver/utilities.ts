export const NodeType = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
};

export const valueNodeTypes = ['INPUT', 'SELECT', 'TEXTAREA'];

export function isElementNode(node: Node) {
  return node && node.nodeType === NodeType.ELEMENT_NODE;
}

export function isElementDisabled(node: HTMLElement) {
  return (
    node &&
    (node.hasAttribute('disabled') || (node as HTMLInputElement).disabled)
  );
}


export function isTextNode(node: Node) {
  return node && node.nodeType === NodeType.TEXT_NODE;
}

export function isValueNode(node: Node) {
  return (
    isElementNode(node) &&
    valueNodeTypes.indexOf((node as Element).tagName) !== -1
  );
}

export function isContentEditable(node: HTMLElement) {
  return !!node.isContentEditable && !!node.getAttribute('contenteditable');
}

export function upClosestElement(node: Node) {
  if (!node) {
    throw new Error('[node] is required');
  }
  const element = isElementNode(node) ? (node as Element) : node.parentElement;
  return element;
}

export function isNodeInDom(node: Node) {
  if (!node) {
    return false;
  }
  const element = upClosestElement(node);
  if (element) {
    const rect = element.getBoundingClientRect();
    if (rect.top || rect.left || rect.height || rect.width) {
      return true;
    }
  }
  let current: Node | null = node;
  while (current) {
    if (current === document.body) {
      return true;
    }
    current = current.parentNode;
  }
  return false;
}

export function queryValueNodes(node: Node) {
  let nodes: Element[] = [];
  if (isValueNode(node)) {
    nodes.push(node as Element);
  } else if (isElementNode(node)) {
    const element = node as Element;
    for (const tag of valueNodeTypes) {
      nodes = nodes.concat(Array.from(element.querySelectorAll(tag)));
    }
  }
  return nodes;
}

export function upFirstValueNode(node: Node, levels = 3) {
  let search = 0;
  let current: Node | null = node;
  while (current && search < levels) {
    if (isValueNode(current)) {
      return current as Element;
    }
    search += 1;
    current = current.parentNode;
  }
  return null;
}
