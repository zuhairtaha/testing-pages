const button = /** @type {!HTMLButtonElement} */ (document.querySelector("button"));
const p = /** @type {!HTMLParagraphElement} */ (document.querySelector("p"));
const node = p.childNodes[0];

button.addEventListener("click", evt => {
  evt.stopPropagation();

  const rangeA = new Range();
  rangeA.setStart(node, 45);
  rangeA.setEnd(node, 76);

  const rangeB = new Range();
  rangeB.setStart(node, 97);
  rangeB.setEnd(node, 102);

  CSS.highlights.set("search-term-highlight", new Highlight(rangeA, rangeB));

  const rangeC = new Range();
  rangeC.setStart(node, 49);
  rangeC.setEnd(node, 52);
  CSS.highlights.set("blue-highlight", new Highlight(rangeC));
});

document.addEventListener("click", () => {
  CSS.highlights.clear();
});
