/** @type {!Array<HTMLElement>} */
const boxes = Array.from(document.querySelectorAll('.box'));

for (const box of boxes) {
  box.style.left = `${Math.floor(Math.random() * 90)}vw`;
  box.style.top = `${Math.floor(Math.random() * 90)}vh`;
}

const sortedBoxes = boxes.sort((a, b) => {
  if (a === b) {
    return 0;
  }

  const position = a.compareDocumentPosition(b);

  if (
    position & Node.DOCUMENT_POSITION_FOLLOWING
    || position & Node.DOCUMENT_POSITION_CONTAINED_BY
  ) {
    return -1;
  }

  if (
    position & Node.DOCUMENT_POSITION_PRECEDING
    || position & Node.DOCUMENT_POSITION_CONTAINS
  ) {
    return 1;
  }

  return 0;
});

for (const [i, box] of sortedBoxes.entries()) {
  box.textContent = i + '';
}
