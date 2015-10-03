var Shoken = function(tracker) {
	
	//
	// Constructor
	//
	
	// Call super
	Publisher.call(this, tracker);
	
	this.copyModified = -1;
	this.modified = 0;

	this.allowedDomains = ["haaretz.co.il", "themarker.com"];

	this.authorsList = ["מירב ארלוזורוב",
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

	this.authorsNormalizedXlatTable = {	 "מירב ארלוזורוב":"merav-arlozorov",
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

	this.articleSelectors = ['article','article.teaser--c','article.article','article.mh__teaser','article.h-mb','article.card','article.media','ul>li','ul>li.g__cell','article.g__cell','article.teaser','div.g__cell>article'];
	
	this.authorSelectors = ['div>div>div>div>div>div.t-byline>address','a>h3[class*="teaser"]>span','a>div.media__content>div.t-byline>address','a>header>p.pic__caption','a>address.t-address','header>div>div>div.t-byline>address>a[rel="author"]','a>div.media__content>p.t-address','a>div>div.t-byline>address','a>h3>span>span.t-kicker','section>div.t-byline>address','a>address.t-address','a>div.t-byline>address','a>div>div.t-byline>address','div.t-byline>address','a>article.media>div.media__content>h3>div.t-epsilon'];

	// Create a uniform name list of authors for tracking
	var dpKeyList = Object.keys(this.authorsNormalizedXlatTable);
	for (var i = 0; i < dpKeyList.length; i++) {
		this.authorsTrackingUniformName[this.authorsNormalizedXlatTable[dpKeyList[i]]] = this.authorsNormalizedXlatTable[dpKeyList[i]];
	}

	for (var j = 0; j < this.authorsList.length; j++) {
		this.authorsRegEx[j] = XRegExp(this.authorsList[j]);
	}
};

Shoken.prototype = Object.create(Publisher.prototype);
Shoken.prototype.constructor = Shoken;

Shoken.prototype.uid = 	function() {
	return 'shoken';
};

Shoken.prototype.run = function(rerun) {
	// TODO run authors hiding once, and set interval to run talkbacks hiding
	this._hideAuthors();
	
	if (!rerun) {
		window.setInterval(this._hideTalkbacks, 1000);
	}
};

Shoken.prototype._hideAuthors = function() {
	if (!this._allowed()) {
		this.tracker.sendEvent('NotAllowedPage', 'na', 1);
		return;
	}

	chrome.storage.sync.get('authors',
						function(items) {
							publisherInstances["Shoken"]._erase(items.authors);
						});

	this.tracker.sendEvent('ScannedPage', window.location.href, 1);
};

Shoken.prototype._climbeToArticle = function(element) {
	var e = element;
	while (e && e !== document.body && e.tagName !== 'ARTICLE') {
		e = e.parentElement;
	}

	if (e && e.tagName === 'ARTICLE')
		return e;

	return null;
};

Shoken.prototype._erase = function(authorsMap) {
	// For tracking
	var blockedAuthorsDict = {};

	this.modified = 0;
	for (var w = 0; w < this.articleSelectors.length; w++) {

		// Select articles
		var articleCards = document.querySelectorAll(this.articleSelectors[w]);

		for (var i = 0; i < articleCards.length; i++) {
			try {
				var articleCardCSSPAth =  UTILS.cssPath(articleCards[i]);

				var specificAddressSelectors = '';
				for (var u = 0; u < this.authorSelectors.length; u++) {
					// Select exactly under
					specificAddressSelectors = articleCardCSSPAth + '>' + this.authorSelectors[u];

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

						for (var a = 0; a < this.authorsRegEx.length; a++) {

							var candidates = this.authorsRegEx[a].exec(actualAuthorString);
							for (var y = 0; candidates !== null && y < candidates.length; y++) {

								var candidate = candidates[y];

								var articleToHide = this._climbeToArticle(authorz[z]);

								var toHide = this._isHide(authorsMap, this.authorsNormalizedXlatTable, candidate);
								if (toHide && this.authorsRegEx[a].test(candidate)) {
									// Hide only if not already hidden
									if (articleToHide !== null) {
										if (articleToHide.style.display !== 'none') {
											articleToHide.style.setProperty('display', 'none', 'important');
										}

										articleToHide.setAttribute('data-zenreader-hide-article','true');
										authorz[z].setAttribute('data-zenreader-hide-author',candidate);

										var k = this._normalizeAuthor(this.authorsNormalizedXlatTable, candidate);
										if (k) {
											blockedAuthorsDict[k] = 1;
										}
									}
								}
								else if (!toHide && this.authorsRegEx[a].test(candidate)) {
									articleToHide.style.setProperty('display', '', '');
									articleToHide.removeAttribute('data-zenreader-hide-article');

									var q = this._normalizeAuthor(this.authorsNormalizedXlatTable, candidate);
									if (q) {
										blockedAuthorsDict[q] = 0;
									}
								}
							}
						}
					}
				}
			} catch(e) {
				console.error('Erase error: ', e);
			}
		}

	}

	this.modified = document.querySelectorAll('[data-zenreader-hide-article]').length;

	if (this.modified !== this.copyModified) {
		this.copyModified = this.modified;
		console.log('sending modified: ', this.copyModified);
		chrome.runtime.sendMessage({incr: this.copyModified}, function(response) {
		});

		var kl = Object.keys(this.authorsTrackingUniformName);
		for (var r = 0; r < kl.length; r++) {
			if (blockedAuthorsDict[this.authorsTrackingUniformName[kl[r]]] > 0) {
				this.tracker.sendEvent('BlockedAuthorOnPage', this.authorsTrackingUniformName[kl[r]], blockedAuthorsDict[this.authorsTrackingUniformName[kl[r]]]);
			}
		}
	}

	this.modified = 0;

};

Shoken.prototype._hideTalkbacks = function() {
	var self = publisherInstances["Shoken"];
	if (!self._allowed())
			return;
		
		// TODO move to object model
		var allTB = getAllTalkbacks('media__content', '.cmt__title', '.cmt__text');
		
		for (var i = 0; i < allTB.length; i++) {
			parseTalkback(allTB[i]);
		}
};



