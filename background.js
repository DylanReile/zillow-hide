console.log('script registered');
alert('howdy');

let hiddenZpids = ["2097205534", "23262737"];

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
    console.log(json);
    let scrubbedJson = scrubHiddenListings(json);
    str = JSON.stringify(scrubbedJson);

    filter.write(encoder.encode(str));
    filter.close();
  };
}

function scrubHiddenListings(json) {
  json.searchResults.listResults = json.searchResults.listResults.filter(e => !hiddenZpids.includes(e.zpid));
  json.searchResults.mapResults = json.searchResults.mapResults.filter(e => !hiddenZpids.includes(e.zpid));
  json.searchList.totalResultCount = json.searchResults.listResults.length;
  return json;
}

browser.webRequest.onBeforeRequest.addListener(
  listener,
  {urls: ["*://*.zillow.com/*"], types: ["xmlhttprequest"]},
  ["blocking"]
);
