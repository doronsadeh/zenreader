// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

var counter = 0;
chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });

//example of using a message handler from the inject scripts
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	 console.log('incr: ', request.incr);
	if (request.incr && request.incr > 0) {
		chrome.browserAction.setBadgeText({text: request.incr.toString()});
	}
	else {
		chrome.browserAction.setBadgeText({text: ''});
	}

    sendResponse({result:"ok"});
  });