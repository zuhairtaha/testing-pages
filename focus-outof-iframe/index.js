const iframe = document.querySelector('iframe');
iframe.addEventListener('load', () => {
  const iframeDocument = iframe.contentDocument;
  iframeDocument.addEventListener('mouseup', () => {
    let ta = document.getElementById('ta');
    if (!ta) {
      ta = document.createElement('textarea');
      ta.id = 'ta';
      document.body.appendChild(ta);
    }
    ta.focus();
  });
});
