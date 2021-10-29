async function getSourceObjectURL(fileSource) {
  const response = await fetch(fileSource);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

async function loadImage() {
  const imgObjectUrl = await getSourceObjectURL('./logo.png');
  const img = new Image();
  img.src = imgObjectUrl;
  document.body.appendChild(img);
  // release the URL resource from memory
  img.addEventListener('load', () => URL.revokeObjectURL(imgObjectUrl));
}

async function loadStyle() {
  const styleObjectUrl = await getSourceObjectURL('./style.css');
  const style = document.createElement('link');
  style.id = 'my-style';
  style.rel = 'stylesheet';
  style.href = styleObjectUrl;
  document.head.appendChild(style);
  style.addEventListener('load', () => URL.revokeObjectURL(styleObjectUrl));
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadImage();
  await loadStyle();
});
