(function() {
  console.log('content script injected');
  injectTrashcans();
  browser.runtime.onMessage.addListener(executor);

  function executor(command) {
    switch(command.type) {
      case 'updatePageResultCount':
        updatePageResultCount(command.data);
        break;
      case 'log':
        log(command.data);
        break;
    }
  }

  function updatePageResultCount(data) {
    document
    .querySelector('.result-count')
    .innerHTML = `${data.totalCount} results (${data.hiddenCount} hidden)`;
  }

  function log(data) {
    console.log(data);
  }

  function injectTrashcans() {
    let trashcan = document.createElement('img');
    trashcan.setAttribute('src', browser.extension.getURL('icons/trashcan.svg'));
    trashcan.classList.add('zillow-hide-trashcan');
    let cards = document.querySelectorAll(
      ':not(.search-list-relaxed-results) > .photo-cards .list-card'
    );
    for (let card of cards) {
      card.appendChild(trashcan.cloneNode());
    }
  }
})();
