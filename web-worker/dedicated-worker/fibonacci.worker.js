/**
 * @param {!number} n
 * @return {!number}
 */
function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

self.addEventListener('message', evt => {
  const fib = fibonacci(evt.data.num);
  self.postMessage(`fibonacci(${evt.data.num}) = ${fib}`);
});
