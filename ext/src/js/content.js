(function() {

	var copyModified = -1;
	var modified = 0;
	
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
					   "tzafi-saar"];
					   
	var allowedDomains = ["haaretz.co.il", "themarker.com"]
				   
	function save_options() {
		var authors = authorsList;
		var authorsMap = {};
		for (var i = 0; i < authors.length; i++) {
			authorsMap[new String(authors[i])] = true;
		}
	  
		chrome.storage.sync.set({
			'authors': authorsMap, 'updated': true,
		}, function() {
		});
	}
	
	function check_and_update_options() {
		chrome.storage.sync.get('updated',
								function(items) {
									if (!items.updated) {
										save_options();
									}
								});
	}

	function getAuthorKey(deadPoetsXlatMap, author) {
		return deadPoetsXlatMap[author];
	}
	
	function isHide(authorsMap, deadPoetsXlatMap, author) {
		var authorKey = deadPoetsXlatMap[author];
		if (authorKey) {
			return authorsMap[authorKey];
		}
		
		return false;
	}

	function climbeToArticle(element) {
		var e = element;
		while (e && e !== document.body && e.tagName !== 'ARTICLE') {
			e = e.parentElement;
		}
		
		if (e && e.tagName === 'ARTICLE')
			return e;
		
		return null;
	}
	
	var articleSelectors = ['article','article.teaser--c','article.article','article.mh__teaser','article.h-mb','article.card','article.media','ul>li','ul>li.g__cell','article.g__cell','article.teaser','div.g__cell>article'];
	var addressSelectors = ['div>div>div>div>div>div.t-byline>address','a>h3[class*="teaser"]>span','a>div.media__content>div.t-byline>address','a>header>p.pic__caption','a>address.t-address','header>div>div>div.t-byline>address>a[rel="author"]','a>div.media__content>p.t-address','a>div>div.t-byline>address','a>h3>span>span.t-kicker','section>div.t-byline>address','a>address.t-address','a>div.t-byline>address','a>div>div.t-byline>address','div.t-byline>address','a>article.media>div.media__content>h3>div.t-epsilon'];
	
	function eraser(authorsMap) {
		// For tracking
		var blockedAuthorsDict = {};
		
		modified = 0;
		for (var w = 0; w < articleSelectors.length; w++) {
			
			// Select articles
			var articleCards = document.querySelectorAll(articleSelectors[w]);

			for (var i = 0; i < articleCards.length; i++) {
				try {
					var articleCardCSSPAth =  UTILS.cssPath(articleCards[i]);
					
					var specificAddressSelectors = ''
					for (var u = 0; u < addressSelectors.length; u++) {
						// Select exactly under 
						specificAddressSelectors = articleCardCSSPAth + '>' + addressSelectors[u];
					
						var authorz = document.querySelectorAll(specificAddressSelectors);
						
						for (var z = 0; z < authorz.length; z++) {
							var author = authorz[z].firstChild;

							var actualAuthorString = '';
							if (typeof author.data != 'undefined') {
								actualAuthorString = author.data;
							}
							else if (typeof author.firstChild != 'undefined' && typeof author.firstChild.data != 'undefined') {
								actualAuthorString = author.firstChild.data;
							}

							for (var a = 0; a < deadPoetsRegEx.length; a++) {
						
								var candidates = deadPoetsRegEx[a].exec(actualAuthorString);
								for (var y = 0; candidates !== null && y < candidates.length; y++) {
									
									var candidate = candidates[y];

									var articleToHide = climbeToArticle(authorz[z]);
									
									var toHide = isHide(authorsMap, deadPoetsXlatMap, candidate); 
									if (toHide && deadPoetsRegEx[a].test(candidate)) {
										// Hide only if not already hidden
										if (articleToHide !== null) {
											if (articleToHide.style.display !== 'none') {
												articleToHide.style.setProperty('display', 'none', 'important');
											}

											articleToHide.setAttribute('data-zenreader-hide-article','true');
											authorz[z].setAttribute('data-zenreader-hide-author',candidate);
											
											var k = getAuthorKey(deadPoetsXlatMap, candidate);
											if (k) {
												blockedAuthorsDict[k] = 1;
											}
										}
									}
									else if (!toHide && deadPoetsRegEx[a].test(candidate)) {
										articleToHide.style.setProperty('display', '', '');
										articleToHide.removeAttribute('data-zenreader-hide-article');
										
										var k = getAuthorKey(deadPoetsXlatMap, candidate);
										if (k) {
												blockedAuthorsDict[k] = 0;
										}
									}
								}
							}
						}
					}
				} catch(e) {
					console.log('oh oh', e);
				}
			}
				
		}

		modified = document.querySelectorAll('[data-zenreader-hide-article]').length;
		
		if (modified !== copyModified) {
			copyModified = modified;
			console.log('sending modified: ', copyModified);
			chrome.runtime.sendMessage({incr: copyModified}, function(response) {
			});
			
			var kl = Object.keys(deadPoetsUniformName);
			for (var r = 0; r < kl.length; r++) {
				if (blockedAuthorsDict[deadPoetsUniformName[kl[r]]] > 0) {
					tracker.sendEvent('BlockedAuthorOnPage', deadPoetsUniformName[kl[r]], blockedAuthorsDict[deadPoetsUniformName[kl[r]]]);
				}
			}
		} 
		
		modified = 0;
		
	}
	
	function req_new_author() {
		if (!document.getElementById('mailto-proxy')) {
			var a = document.createElement('a');
			a.id = 'mailto-proxy';
			a.href = "mailto:doron.sadeh.dev@gmail.com?subject=Request%20new%20author%20block&body=Please%20add:%20";
			document.body.appendChild(a);
		}
		
		document.getElementById('mailto-proxy').click();
	}
	
	var originals = {
		"background_color":"",
		"webkit_filter":"",
		"filter":""
	}	

	function lightbox(on) {
		if (on) {
			originals.background_color = document.body.style.getPropertyValue('background-color');
			originals.webkit_filter = document.body.style.getPropertyValue('-webkit-filter');
			originals.filter = document.body.style.getPropertyValue('filter');
			
			document.body.style.setProperty('background-color','#eee', '');
			document.body.style.setProperty('-webkit-filter', 'opacity(1.00) brightness(0.4) blur(3px)', '');
			document.body.style.setProperty('filter', 'opacity(1.00) brightness(0.4) blur(3px)', '');
		}
		else {
			document.body.style.setProperty('background-color',originals.background_color, '');
			document.body.style.setProperty('-webkit-filter', originals.webkit_filter, '');
			document.body.style.setProperty('filter', original.filter, '');
		}
	}

	function allowed() {
		for (var i = 0; i < allowedDomains.length; i++) {
			if (window.location.hostname.endsWith(allowedDomains[i]))
				return true;
		}
		
		return false;
	}
	
	function scan() {
		
		if (!allowed()) {
			tracker.sendEvent('NotAllowedPage', 'na', 1);
			return;
		}
		
		chrome.storage.sync.get('authors',
							function(items) {
								eraser(items.authors);
							});
							
		tracker.sendEvent('ScannedPage', window.location.href, 1);
	}
	
	if (window === window.top) {

		var deadPoets = ["מירב ארלוזורוב",
						 "מרב ארלוזורוב",
						 "גדעון לוי",
						 "גידעון לוי",
						 "בני ציפר",
						 "עפרי אילני",
						 "רוויטל מדר",
						 "אורי כץ",
						 "אנשיל פפר",
						 "אייל שגיא ביזאוי",
						 "איל שגיא ביזאוי",
						 "הני זוביידה",
						 "הני זובידה",
						 "ציפר",
						 "תהל פרוש",
						 "נחמיה שטרסלר",
						 "קרולינה לנדסמן",
						 "צפי סער"];
		
		var deadPoetsXlatMap = { "מירב ארלוזורוב":"merav-arlozorov",
								 "מרב ארלוזורוב":"merav-arlozorov",
								 "גדעון לוי":"gideon-levi",
								 "גידעון לוי":"gideon-levi",
								 "בני ציפר":"benny-tzipper",
								 "עפרי אילני":"ofri-ilani",
								 "רוויטל מדר":"revital-madar",
								 "אורי כץ":"uri-katz",
								 "אנשיל פפר":"anshil-pepper",
								 "אייל שגיא ביזאוי":"eyal-sagie-bizaui",
								 "איל שגיא ביזאוי":"eyal-sagie-bizaui",
								 "הני זוביידה":"hani-zubida",
								 "הני זובידה":"hani-zubida",
								 "ציפר":"benny-tzipper",
								 "תהל פרוש":"tahel-farosh",
								 "נחמיה שטרסלר":"nehamia-shtresler",
								 "קרולינה לנדסמן":"carolina-landsman",
								 "צפי סער":"tzafi-saar"};
						 						 

		// Create a uniform name list of authors for tracking
		var dpKeyList = Object.keys(deadPoetsXlatMap);
		var deadPoetsUniformName = {};
		for (var i = 0; i < dpKeyList.length; i++) {
			deadPoetsUniformName[deadPoetsXlatMap[dpKeyList[i]]] = deadPoetsXlatMap[dpKeyList[i]];
		}
		
		var deadPoetsRegEx = [];
		for (var i = 0; i < deadPoets.length; i++) {
			deadPoetsRegEx[i] = XRegExp(deadPoets[i]);
		}
		
		check_and_update_options();
		
		console.log('sending modified 1st time: 0');
		chrome.runtime.sendMessage({incr: '0'}, function(response) {
			// Quiet
		});
		
		chrome.storage.onChanged.addListener(function(changes, namespace) {
		  for (key in changes) {
			if (key === 'refresh') {
				scan();
			}
			if (key === 'req_new_author') {
				req_new_author();
			}
			if (key === 'options_on') {
				// lightbox(changes[key].newValue.startsWith('on_'));
			}
		  }
		});

		// You'll usually only ever have to create one service instance.
		var service = analytics.getService('zen_reader');

		// You can create as many trackers as you want. Each tracker has its own state
		// independent of other tracker instances.
		var tracker = service.getTracker('UA-67866543-1');  
		
		tracker.sendAppView('Loaded');

		// 1st time scan
		scan();
	}
})();