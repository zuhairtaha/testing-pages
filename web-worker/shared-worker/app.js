const worker = new SharedWorker('shared-worker.js', { name: 'counter-worker' });
worker.port.onmessage = function (event) {
  console.log(event.data);
};

document.addEventListener('click', () => {
  worker.port.postMessage('click');
});
