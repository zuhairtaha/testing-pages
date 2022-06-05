import { PromiseCapability } from './PromiseCapability.js';

const workerManeger = new (class {
  constructor() {
    /**
     * @private
     * @type {!SharedWorker}
     */
    this._worker = new SharedWorker('shared-worker.js', { name: 'zt-worker' });

    /**
     * @private
     * @type {!number}
     */
    this._messageId = 0;

    /**
     * @private
     * @type {!Map<!number, !PromiseCapability<!string>>}
     */
    this._textCapabilities = new Map();

    this._initListeners();
  }

  /**
   * @private
   */
  _initListeners() {
    this._worker.port.addEventListener('message', evt =>
      this._handleMessage(evt.data)
    );

    this._worker.port.start();
  }

  /**
   * @private
   * @param {!{id: !number, text: !string}} message
   */
  _handleMessage(message) {
    if (this._textCapabilities.has(message.id)) {
      this._textCapabilities.get(message.id).resolve(message.text);
      this._textCapabilities.delete(message.id);
      return;
    }

    console.error('Unknown message or message handled in another place(tab/window)');
  }

  /**
   * @param {!string} text
   * @return {!Promise<!string>}
   */
  parseText(text) {
    const id = this._messageId++;
    this._worker.port.postMessage({ id, text });
    this._textCapabilities.set(id, PromiseCapability.create());

    return this._textCapabilities.get(id).promise;
  }
})();

document.addEventListener('click', () => {
  workerManeger.parseText('Hello from main thread').then(text => {
    console.log(text);
  });
});
