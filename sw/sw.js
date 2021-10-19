self.addEventListener('fetch', (/** @type {FetchEvent} */ evt) => {
  evt.respondWith(
    Promise.resolve().then(() => {
      if (evt.request.url.includes('chrome-extension://')) {
        return null;
      }
      return fetch(evt.request);
    })
  );
});
