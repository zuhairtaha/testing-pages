const ta = document.getElementById('ta');

(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const iframes = [];
  const outer = document.querySelector('iframe');
  iframes.push(outer);

  const inner = outer.contentDocument.querySelector('iframe');
  iframes.push(inner);

  for (const iframe of iframes) {
    const doc = iframe.contentDocument;
    doc.addEventListener('mouseup', () => {
      ta.focus();
    });
  }
})();
