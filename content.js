console.log('content script injected');
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
