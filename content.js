console.log('content script injected');
browser.runtime.onMessage.addListener(logger);

function logger(msg) {
  console.log(msg)
}
