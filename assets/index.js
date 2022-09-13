const links = document.querySelectorAll('a');

document.getElementById('open-all')?.addEventListener('click', () => {
  for (const link of links) {
    link.target = '_blank';
    link.click();
  }
});

const frame = /** @type {!HTMLIFrameElement} */ (
  document.getElementById('frame')
);

document.addEventListener('mousemove', evt => {
  if (!(evt?.target instanceof HTMLAnchorElement)) {
    return;
  }

  if (frame.src === evt.target.href) {
    return;
  }

  if (evt.target.classList.contains('download')) {
    return;
  }

  frame.src = evt.target.href;
});

function showHidden() {
  for (const link of links) {
    link.classList.remove('hidden');
  }
}
