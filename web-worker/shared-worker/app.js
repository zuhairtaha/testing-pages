// Cross-Tab Communication: Open the same tab or any other tab includes app.js 
// Then you can get the messsage in all of the tabs.

const worker = new SharedWorker('shared-worker.js', { name: 'counter-worker' });
worker.port.onmessage = function (event) {
  console.log(event.data);
};

document.addEventListener('click', () => {
  worker.port.postMessage('click');
});
