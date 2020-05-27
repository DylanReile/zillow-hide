(function() {
  injectTrashcansAsNeeded();
  registerTrashcanClickListener();
  listenToCommandsFromBackgroundScript();

  function listenToCommandsFromBackgroundScript() {
    browser.runtime.onMessage.addListener(executor);
  }

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

  function injectTrashcansAsNeeded() {
    injectTrashcans();
    let observee = document.querySelector('#grid-search-results');
    let config = { childList: true };
    let observer = new MutationObserver(injectTrashcans);
    observer.observe(observee, config);
  }

  function injectTrashcans() {
    let cards = document.querySelectorAll(
      ':not(.search-list-relaxed-results) > .photo-cards .list-card'
    );

    for (let card of cards) {
      if(!card.dataset.trashcanInjected) {
        card.dataset.trashcanInjected = true;
        card.insertAdjacentHTML('beforeend', trashcanMarkup());
      }
    }
  }

  function registerTrashcanClickListener() {
    let listResults = document.querySelector('#search-page-list-container');
    listResults.addEventListener('click', (e) => {
      if(e.target.className === 'zillow-hide__trashcan__button') {
        e.stopPropagation();
        let card = e.target.closest('.list-card');
        let zpid = card.id.split('_')[1];
        backgroundAction({
          type: 'hideZpid',
          data: zpid
        });

        forceRedraw();
      }
    });
  }

  function backgroundAction(command) {
    browser.runtime.sendMessage(command);
  }

  function forceRedraw() {
    // This is a hack that works by changing the value in the "sort by"
    // dropdown, then changing it back. This triggers a Redux event, forcing
    // React to rehydrate its components. It happens so quickly that nothing
    // odd appears to happen to the user.
    let sortByCurrentOptionText = document
      .querySelector('.sort-popover span')
      .textContent;

    let sortByOptions = Array.from(
      document
      .querySelector('.sort-popover .dropdown')
      .children
    );

    let sortByCurrentOption = sortByOptions.find(option => {
      return option.textContent === sortByCurrentOptionText
    });

   let sortByDifferentOption = sortByOptions.find(option => {
    return option.textContent !== sortByCurrentOptionText
   });

   sortByDifferentOption.click();
   sortByCurrentOption.click();
  }

  function trashcanMarkup() {
    return `<button class="zillow-hide__trashcan__button">
        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="zillow-hide__trashcan__icon">
        <path d="M14.8019 2.39617H11.6887C11.5334 1.04952 10.3877 0 9.00001 0C7.6124 0 6.46682 1.04948 6.31152 2.39617H3.19819C1.93831 2.39617 0.913452 3.42132 0.913452 4.68115V4.79839C0.913452 5.76115 1.51292 6.58519 2.3574 6.92095V17.7151C2.3574 18.9749 3.38238 20 4.64217 20H13.3579C14.6178 20 15.6427 18.9749 15.6427 17.7151V6.92099C16.4871 6.58519 17.0866 5.76115 17.0866 4.79844V4.6812C17.0866 3.42132 16.0617 2.39617 14.8019 2.39617ZM9.00001 1.08364C9.78922 1.08364 10.448 1.64932 10.5937 2.39617H7.40657C7.55229 1.64928 8.21108 1.08364 9.00001 1.08364ZM14.559 17.7151C14.559 18.3775 14.0201 18.9164 13.3579 18.9164H4.64213C3.97994 18.9164 3.441 18.3774 3.441 17.7151V7.08338H14.559V17.7151ZM16.003 4.79839C16.003 5.46079 15.464 5.99978 14.8018 5.99978H3.19819C2.53599 5.99978 1.99705 5.46079 1.99705 4.79839V4.68115C1.99705 4.01875 2.53599 3.47977 3.19819 3.47977H14.8019C15.4641 3.47977 16.003 4.01875 16.003 4.68115V4.79839H16.003Z" fill="#ffffff"/>
        <path d="M6.09508 17.5306C6.39432 17.5306 6.63689 17.288 6.63689 16.9888V10.8883C6.63689 10.5891 6.39428 10.3464 6.09508 10.3464C5.79589 10.3464 5.55328 10.5891 5.55328 10.8883V16.9888C5.55324 17.288 5.79585 17.5306 6.09508 17.5306Z" fill="#ffffff"/>
        <path d="M8.99999 17.5306C9.29922 17.5306 9.54182 17.288 9.54182 16.9888V10.8883C9.54182 10.5891 9.29913 10.3464 8.99999 10.3464C8.70079 10.3464 8.45819 10.5891 8.45819 10.8883V16.9888C8.45819 17.288 8.70075 17.5306 8.99999 17.5306Z" fill="#ffffff"/>
        <path d="M11.9049 17.5306C12.2041 17.5306 12.4467 17.288 12.4467 16.9888V10.8883C12.4467 10.5891 12.2041 10.3464 11.9049 10.3464C11.6057 10.3464 11.3631 10.5891 11.3631 10.8883V16.9888C11.3631 17.288 11.6057 17.5306 11.9049 17.5306Z" fill="#ffffff"/>
        </svg>
      </button>`;
  }
})();
