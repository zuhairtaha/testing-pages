document.getElementById('open-all').addEventListener('click', function () {
  const links = document.querySelectorAll('a');
  for (const link of links) {
    link.target = '_blank';
    link.click();
  }
});

const frame = document.getElementById('frame');

document.addEventListener('mousemove', evt => {
  if (evt.target.tagName !== 'A') return;
  if (frame.src === evt.target.href) return;
  if (evt.target.classList.contains('download')) return;

  frame.src = evt.target.href;
});
