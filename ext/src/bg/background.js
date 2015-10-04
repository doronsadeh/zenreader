function applyOptions(authorsMap) {
	chrome.storage.sync.set({
		'authors': authorsMap,
	}, function() {
		// Quiet
	});
	
	var trigger = Math.random();
	chrome.storage.sync.set({'refresh': trigger});
}

function setAllOptions() {
	var authorsMap = {};
	numBlockedAuthors = 0
	for (var i = 0; i < authorsList.length; i++) {
		authorsMap[authorsList[i]] = true;
	}

	// Save them to local storage
	applyOptions(authorsMap);
}
				   
function updateOptions() {
	// Read current options, and set those who are new (after version update if any)
	var authorsMap = {};
	chrome.storage.sync.get('authors',
							function(items) {
								authorsMap = items.authors;
							});
							
	numBlockedAuthors = 0;
	for (var i = 0; i < authorsList.length; i++) {
		// If author already saved to local storgae, skip
		if (authorsMap[authorsList[i]])
			continue;
		
		// Else ... save it, and set by default
		authorsMap[authorsList[i]] = true;
	}
  
	// Save changes
	applyOptions(authorsMap);
}

function applyTrackers(_anonID) {
	
	console.log('applying trackers with AID: ', _anonID);
	
	// Send initial event 
	tracker.sendEvent('panIDPing_v127', _anonID,  Date.now());

	// Ping GA every half an hour, with anonymized random ID to show how many active users we really have
	window.setInterval(function() {tracker.sendEvent('panIDPing_v127', _anonID,  Date.now());},  1000*60*30);
}

function startTracker() {
	// Read anonID from local storage
	chrome.storage.sync.get('anonID',
							function(items) {
								// Get the anonymous ID
								anonID = items.anonID;

								if (anonID && anonID.length > 0 && anonID.startsWith('aid_')) {
									applyTrackers(anonID);
								}
								else {
									// Else, tell me, cause this is a bug
									tracker.sendEvent('panIDPing_v127', 'AID regenerated',  Date.now());
									
									// But, don't leave it empty. Set it. And start trackers
									anonID = 'aid_' + Math.random();
									chrome.storage.sync.set({'anonID': anonID});
									applyTrackers(anonID);
								}
							});
}

//
// main
//
var anonID = 'aid_not_set';

var authorsList = ["gideon-levi", 
                   "merav-arlozorov",
                   "benny-tzipper",
                   "ofri-ilani",
                   "revital-madar",
                   "uri-katz",
                   "anshil-pepper",
                   "eyal-sagie-bizaui",
                   "hani-zubida",
                   "tahel-farosh",
				   "nehamia-shtresler",
				   "carolina-landsman",
				   "tzafi-saar",
				   "merav-michaeli",
				   "noa-ast",
				   "ron-ben-yishai",
				   "yoaz-hendel",
				   "itay-gal"];

// You'll usually only ever have to create one service instance.
var service = analytics.getService('zen_reader');

// You can create as many trackers as you want. Each tracker has its own state
// independent of other tracker instances.
var tracker = service.getTracker('UA-67866543-1');

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details) {
    if(details.reason == "install") {
        console.log("ZenReader first time install. Saving options.");
		
		// Set all authors to block on first time install
		setAllOptions();

		// Set one time anonymous ID, and write it to local storage
		anonID = 'aid_' + Math.random();
		chrome.storage.sync.set({'anonID': anonID});
		
		// Start GA tracker
		startTracker();
		
    } else if (details.reason == "update") {
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Zen Reader updated from " + details.previousVersion + " to " + thisVersion + ". Updating options.");
		
		// Update all new authors (added in updated version) to block, but leave all others as set by user
		updateOptions();
		
		// Start the tracker (we should already have an AID)
		startTracker();
    }
});

var counter = 0;
chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });

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
  
