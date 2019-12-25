/**
  - ELEMENT_NODE - An Element node such as <p> or <div>.
  - TEXT_NODE - The actual Text of Element or Attr.
  - CDATA_SECTION_NODE - A CDATASection.
  - PROCESSING_INSTRUCTION_NODE - A ProcessingInstruction of an XML document such as <?xml-stylesheet ... ?> declaration.
  - COMMENT_NODE - A Comment node.
  - DOCUMENT_NODE - A Document node.
  - DOCUMENT_TYPE_NODE - A DocumentType node e.g. <!DOCTYPE html> for HTML5 documents.
  - DOCUMENT_FRAGMENT_NODE - A DocumentFragment node.
 */
export const NodeType = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 1,
  DOCUMENT_FRAGMENT_NODE: 1,
};
