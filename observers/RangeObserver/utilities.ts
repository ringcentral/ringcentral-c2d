const NodeType = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
};

const valueNodeTypes = ['INPUT', 'SELECT', 'TEXTAREA'];

export function isElementNode(node: Node): boolean {
  return node && node.nodeType === NodeType.ELEMENT_NODE;
}

export function isTextNode(node: Node): boolean {
  return node && node.nodeType === NodeType.TEXT_NODE;
}

export function isValueNode(node: Node): boolean {
  return (
    isElementNode(node) &&
    valueNodeTypes.indexOf((node as Element).tagName) !== -1
  );
}

export function upClosestElement(node: Node): Element {
  if (!node) {
    throw new Error('[node] is required');
  }
  const element = isElementNode(node) ? (node as Element) : node.parentElement;
  return element;
}

export function isNodeInDom(node: Node): boolean {
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
  let current = node;
  while (current) {
    if (current === document.body) {
      return true;
    }
    current = current.parentNode;
  }
  return false;
}

export function queryValueNodes(node: Node): Element[] {
  let nodes = [];
  if (isValueNode(node)) {
    nodes.push(node);
  } else if (isElementNode(node)) {
    const element = node as Element;
    for (const tag of valueNodeTypes) {
      nodes = nodes.concat(Array.from(element.querySelectorAll(tag)));
    }
  }
  return nodes;
}

export function upFirstValueNode(node: Node, levels: number = 3): Element {
  let search = 0;
  let current = node;
  while (current && search < levels) {
    if (isValueNode(current)) {
      return current as Element;
    }
    search += 1;
    current = current.parentNode;
  }
  return null;
}
