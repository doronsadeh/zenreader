var publishers = ["Shoken", "Ynet"];
var publisherInstances = {};

(function() {

	var tracker = null;
	
	
	function req_new_author() {
		if (!document.getElementById('mailto-proxy')) {
			var a = document.createElement('a');
			a.id = 'mailto-proxy';
			a.href = "mailto:doron.sadeh.dev@gmail.com?subject=Request%20new%20author%20block&body=Please%20add:%20";
			document.body.appendChild(a);
		}

		document.getElementById('mailto-proxy').click();
	}

	function run(rerun) {
		// Run each publisher
		var keys = Object.keys(publisherInstances)
		for (var j = 0; j < keys.length; j++) {
			publisherInstances[keys[j]].run(rerun);
		}
	}
	
	// Now run this ONCE per page (do NOT run this in each iframe)
	if (window === window.top) {

		chrome.runtime.sendMessage({incr: '0'}, function(response) {
		});

		chrome.storage.onChanged.addListener(function(changes, namespace) {
		  for (key in changes) {
			if (key === 'refresh') {
				run(true);
			}
			if (key === 'req_new_author') {
				req_new_author();
			}
		  }
		});

		// You'll usually only ever have to create one service instance.
		var service = analytics.getService('zen_reader');

		// You can create as many trackers as you want. Each tracker has its own state
		// independent of other tracker instances.
		tracker = service.getTracker('UA-67866543-1');

		tracker.sendAppView('Loaded');

		// Create all publishers
		for (var i = 0; i < publishers.length; i++) {
			publisherInstances[publishers[i]] = new window[publishers[i]](tracker);
			console.log("Created ", publishers[i], publisherInstances[publishers[i]]);
		}

		run(false);
	}
	
})();

