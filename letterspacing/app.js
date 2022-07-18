(() => {
  const div = document.getElementById('d');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  if (!div) return;
  const text = div.textContent.trim();
  if (!text) return;

  ctx.font = `14px arial`;
  const textWidth = ctx.measureText(text).width;
  const diff = Number.parseInt(div.style.width) - textWidth;
  const letterSpacing = diff / text.length;
  div.style.letterSpacing = letterSpacing + 'px';
})();
