let counter = 0;
const ports = [];

self.onconnect = function (event) {
  const port = event.ports[0];
  ports.push(port);

  port.onmessage = function (event) {
    counter++;
    ports.forEach(port => port.postMessage(counter));
  };
};
