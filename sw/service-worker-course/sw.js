const _self = /** @type {!ServiceWorkerGlobalScope} */ (self);

_self.addEventListener('fetch', evt => {
  console.log(evt);
});
