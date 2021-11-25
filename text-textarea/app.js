document.addEventListener('DOMContentLoaded', () => {
  const selection = window.getSelection();
  const range = new Range();
  range.selectNodeContents(document.querySelector('main'));
  selection.removeAllRanges();
  selection.addRange(range);
});
