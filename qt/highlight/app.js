const node = document.querySelector("p")?.childNodes[0];
if (!node) throw new Error("No text node found");

document.querySelector("#set-sample")?.addEventListener("click", evt => {
  evt.stopPropagation();

  const rangeA = new Range();
  rangeA.setStart(node, 45);
  rangeA.setEnd(node, 76);

  const rangeB = new Range();
  rangeB.setStart(node, 97);
  rangeB.setEnd(node, 102);

  CSS.highlights.set("yellow-highlight", new Highlight(rangeA, rangeB));

  const rangeC = new Range();
  rangeC.setStart(node, 49);
  rangeC.setEnd(node, 52);
  CSS.highlights.set("blue-highlight", new Highlight(rangeC));
});

document.querySelector("#clear-sample")?.addEventListener("click", () => {
  CSS.highlights.clear();
});

document.querySelector("#set-on-selection")?.addEventListener("click", () => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const highlightType = /** @type {HTMLSelectElement} */ (document.querySelector("#highlight-options")).value;
    CSS.highlights.set(highlightType, new Highlight(range));
  } else {
    alert("Please select some text to highlight.");
  }
});
