const button = document.querySelector('button');

button.addEventListener('click', () => {
  const selection = window.getSelection();
  const range = document.createRange();
  selection.removeAllRanges();
  range.selectNodeContents(document.querySelector('main'));
  selection.addRange(range);
});
