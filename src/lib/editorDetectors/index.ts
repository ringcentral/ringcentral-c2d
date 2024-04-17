export function isRadEditor(): boolean {
  if (document.querySelector('[id^="RADEDITORSTYLESHEET"]')) {
    return true;
  }
  return false;
}

export function isContentEditable(node: Node): boolean {
  let current: Node | null = node;
  while (current) {
    if (
      current instanceof HTMLElement &&
      (current.isContentEditable || current.getAttribute('contentEditable'))
    ) {
      return true;
    }
    current = current.parentNode;
  }
  return false;
}

export function isDocumentEditable(): boolean {
  return isContentEditable(document.body);
}
