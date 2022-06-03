const worker = new Worker('fibonacci.worker.js');

document.addEventListener('click', () => {
  const random = Math.round(Math.random() * 10);
  worker.postMessage({ num: random });
});

worker.addEventListener('message', evt => {
  console.log(evt.data);
});
