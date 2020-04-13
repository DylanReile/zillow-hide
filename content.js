console.log('content script injected');
browser.runtime.onMessage.addListener(processListings);

function processListings(listings) {
  document
  .querySelector('.result-count')
  .innerHTML = `${listings.totalCount} results (${listings.hiddenCount} hidden)`;
}
