console.log('content script injected');
browser.runtime.onMessage.addListener(processListings);

function processListings(scrubbedJson) {
  console.log(scrubbedJson);
}
