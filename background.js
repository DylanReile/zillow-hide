alert('background script registered');

let hiddenZpids = ["2097205534", "23262737", "67037838"];
//browser.storage.local.set({'hiddenZpids': hiddenZpids});
//browser.storage.local.get('hiddenZpids').then(obj => messageContentScript({type: 'log', data: obj}));

function listener(details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let decoder = new TextDecoder("utf-8", {fatal: true});
  let encoder = new TextEncoder();

  let data = [];
  filter.ondata = event => {
    data.push(event.data);
  };

  filter.onstop = event => {
    let str = "";
    if (data.length == 1) {
      str = decoder.decode(data[0]);
    }
    else {
      for (let i = 0; i < data.length; i++) {
        let stream = (i == data.length - 1) ? false : true;
        str += decoder.decode(data[i], {stream});
      }
    }
    let json = JSON.parse(str);

    updatePageResultCount(json.searchResults.listResults);
    let scrubbedJson = scrubHiddenListings(json);
    str = JSON.stringify(scrubbedJson);

    filter.write(encoder.encode(str));
    filter.close();
  };
}

function contentAction(command) {
  browser.tabs.query({
    currentWindow: true,
    active: true
  }).then((tabs) => {
    for(let tab of tabs) {
      browser.tabs.sendMessage(tab.id, command)
    }
  })
}

function scrubHiddenListings(json) {
  if(json.searchResults.listResults) {
    json.searchResults.listResults = json
      .searchResults
      .listResults
      .filter(e => !hiddenZpids.includes(e.zpid));
  }

  json.searchResults.mapResults = json
    .searchResults
    .mapResults
    .filter(e => !hiddenZpids.includes(e.zpid));

  return json;
}

function updatePageResultCount(listResults) {
  let hiddenResultCount = listResults.reduce((count, e) => {
    return hiddenZpids.includes(e.zpid) ? count += 1 : count
  }, 0);

  contentAction({
    type: 'updatePageResultCount',
    data: {
      totalCount: listResults.length,
      hiddenCount: hiddenResultCount
    }
  });
}

browser.webRequest.onBeforeRequest.addListener(
  listener,
  {
    urls: ["*://*.zillow.com/search/GetSearchPageState.htm*"],
    types: ["xmlhttprequest"]
  },
  ["blocking"]
);
