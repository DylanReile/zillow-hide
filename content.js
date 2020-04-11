console.log('content script injected');
browser.runtime.onMessage.addListener(processListings);

function processListings(listings) {
  console.log(listings.hiddenCount);
}
