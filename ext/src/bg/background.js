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
  
// You'll usually only ever have to create one service instance.
var service = analytics.getService('zen_reader');

// You can create as many trackers as you want. Each tracker has its own state
// independent of other tracker instances.
var tracker = service.getTracker('UA-67866543-1');

var anonID = 'aid_' + Math.random();

// Send initial event 
tracker.sendEvent('AIDPing', anonID,  Date.now());

// Ping GA every half an hour, with anonymized random ID to show how many active users we really have
window.setInterval(function() {tracker.sendEvent('AIDPing', anonID,  Date.now());},  1000*60*30);

