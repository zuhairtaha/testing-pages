// @ts-nocheck
const ctx = /** @type {!SharedWorkerGlobalScope} */ (self);

const ports = [];
ctx.addEventListener('connect', e => {
  const [port] = e.ports;
  ports.push(port);

  port.addEventListener('message', handleWorkerMessage);
  port.start();
});

function handleWorkerMessage(evt) {
  const message = /** @type {!{id: !number, text: !string}} */ (evt.data);
  for (const port of ports) {
    port.postMessage({
      id: message.id,
      text: message.text.toUpperCase()
    });
  }
}
