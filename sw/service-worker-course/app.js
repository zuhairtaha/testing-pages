(async () => {
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.register('./sw.js', {
      scope: './'
    });
    console.log(reg);
  }
})().catch(console.error);
