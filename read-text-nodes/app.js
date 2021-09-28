function clone() {
  const sel = getSelection();
  const range = sel.getRangeAt(0);

  const container =
    range.commonAncestorContainer instanceof Element
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;

  const rect = container.getBoundingClientRect();

  const outline = /** @type {!HTMLElement} */ (container.cloneNode(true));

  outline.style.position = 'absolute';
  outline.style.left = rect.left + document.documentElement.scrollLeft + 'px';
  outline.style.top = rect.top + document.scrollingElement.scrollTop + 'px';
  outline.style.width = rect.width + 'px';
  outline.style.height = rect.height + 'px';
  outline.style.boxShadow = '0 0 10px #000';
  outline.style.margin = '0';
  outline.classList.add('outline');

  document.body.appendChild(outline);
  cloneRange(container, outline, range);
  console.log(outline);
}

function cloneRange(originalEl, clonedEl, originalRange) {
  const originalNodes = getElementNodes(originalEl);
  const clonedNodes = getElementNodes(clonedEl);
  const range = new Range();

  const startIndex = originalNodes.indexOf(originalRange.startContainer);
  const startContainer = clonedNodes[startIndex];
  range.setStart(startContainer, originalRange.startOffset);

  const endIndex = originalNodes.indexOf(originalRange.endContainer);
  const endContainer = clonedNodes[endIndex];
  range.setEnd(endContainer, originalRange.endOffset);

  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  // Mark selection
  const fragment = range.extractContents();
  const texts = getElementNodes(fragment, NodeFilter.SHOW_TEXT);
  texts.forEach(text => {
    const mark = document.createElement('mark');
    text.replaceWith(mark);
    mark.appendChild(text);
  });
  range.insertNode(fragment);
}

// mark words
// each text without mark parent, mark it

/**
 * @param {Node} element
 * @param {!number} filter
 */
function getElementNodes(element, filter = NodeFilter.SHOW_ALL) {
  const nodes = [];
  const iterator = document.createNodeIterator(element, filter);
  let node;
  while ((node = iterator.nextNode())) {
    nodes.push(node);
  }
  return nodes;
}


const range = new Range();
const node = document.getElementById('ss').childNodes[0];
range.setStart(node, 76);
range.setEnd(node, 101);
const selection = window.getSelection();
selection.removeAllRanges();
selection.addRange(range);
