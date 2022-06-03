const ports = [];

const ctx = /** @type {!SharedWorkerGlobalScope } */ (self);

ctx.addEventListener('connect', evt => {
  const port = evt.ports[0];
  ports.push(port);
  console.log(ports);

  port.addEventListener('message', evt => {
    console.log(evt.data);
    for (const port of ports) {
      port.postMessage('res to ' + evt.data);
    }
  });

  setInterval(() => {
    for (const port of ports) {
      port.postMessage(Date.now());
    }
  }, 1000);

  port.start();
});
