const worker = new SharedWorker('shared-worker.js');

worker.port.addEventListener('message', evt => {
  console.log(evt.data);
});

worker.port.start();

worker.port.postMessage('a message from app.js');
