console.log('content script injected');
//browser.runtime.onMessage(logger);

function logger(msg) {
  console.log(msg);
}
