/** @type {!HTMLDivElement} */
const div = document.querySelector('div.editable');

div.focus();

const range = new Range();
range.selectNode(div);

const textElement = div.firstElementChild.childNodes[0];

range.setStart(textElement, 3);
range.setEnd(textElement, 3);

const sel = document.getSelection();
sel.removeAllRanges();
sel.addRange(range);

setTimeout(() => {
  ['keydown', 'keypress', 'keyup'].forEach(x => {
    div.dispatchEvent(
      new KeyboardEvent(x, { bubbles: true, cancelable: false })
    );
  });
}, 1000);
