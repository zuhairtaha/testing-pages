/**
 * @template T
 */
export class PromiseCapability {
  /**
   * @param {!Promise<T>} promise
   * @param {!function(T): void} resolve
   * @param {!function(*): void} reject
   */
  constructor(promise, resolve, reject) {
    /** @type {!Promise<T>} */
    this.promise = promise;

    /** @type {!function(T): void} */
    this.resolve = resolve;

    /** @type {!function(*): void} */
    this.reject = reject;
  }

  static create() {
    const capability = {};
    capability.promise = new Promise((resolve, reject) => {
      capability.resolve = resolve;
      capability.reject = reject;
    });
    return new PromiseCapability(
      capability.promise,
      capability.resolve,
      capability.reject
    );
  }
}
