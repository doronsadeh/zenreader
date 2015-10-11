var TheMarker = function(tracker) {
	
	//
	// Constructor
	//
	
	// Call super
	Publisher.call(this, tracker);
	
	this.allowedDomains = ["themarker.com"];

                        ["gideon-levi",
                            "merav-arlozorov",
                            "benny-tzipper",
                            "ofri-ilani",
                            "uri-katz",
                            "eyal-sagie-bizaui",
                            "hani-zubida",
                            "nehamia-shtresler",
                            "carolina-landsman",
                            "noa-ast"];
    
	this.authorsList = ["מירב ארלוזורוב",
						"מרב ארלוזורוב",
						 "גדעון לוי",
						 "גידעון לוי",
						 "בני ציפר",
						 "עפרי אילני",
						 "אורי כץ",
						 "אייל שגיא ביזאוי",
						 "איל שגיא ביזאוי",
						 "הני זוביידה",
						 "הני זובידה",
						 "ציפר",
						 "נחמיה שטרסלר",
						 "קרולינה לנדסמן",
						 "נועה אסטרייכר",
						 "נעה אסטרייכר"];

	this.authorsNormalizedXlatTable = {	 "מירב ארלוזורוב":"merav-arlozorov",
										 "מרב ארלוזורוב":"merav-arlozorov",
										 "גדעון לוי":"gideon-levi",
										 "גידעון לוי":"gideon-levi",
										 "בני ציפר":"benny-tzipper",
										 "עפרי אילני":"ofri-ilani",
										 "אורי כץ":"uri-katz",
										 "אייל שגיא ביזאוי":"eyal-sagie-bizaui",
										 "איל שגיא ביזאוי":"eyal-sagie-bizaui",
										 "הני זוביידה":"hani-zubida",
										 "הני זובידה":"hani-zubida",
										 "ציפר":"benny-tzipper",
										 "נחמיה שטרסלר":"nehamia-shtresler",
										 "קרולינה לנדסמן":"carolina-landsman",
										 "צפי סער":"tzafi-saar",
										 "נועה אסטרייכר":"noa-ast",
										 "נעה אסטרייכר":"noa-ast"};

	this.authorSelectors = ['address','a>h3[class*="teaser"]>span','a>header>p.pic__caption','address>a[rel="author"]','a>div.media__content>p.t-address','a>h3>span>span.t-kicker','a>article.media>div.media__content>h3>div.t-epsilon'];

	// Create a uniform name list of authors for tracking
	var dpKeyList = Object.keys(this.authorsNormalizedXlatTable);
	for (var i = 0; i < dpKeyList.length; i++) {
		this.authorsTrackingUniformName[this.authorsNormalizedXlatTable[dpKeyList[i]]] = this.authorsNormalizedXlatTable[dpKeyList[i]];
	}

	for (var j = 0; j < this.authorsList.length; j++) {
		this.authorsRegEx[j] = XRegExp(this.authorsList[j]);
	}

    this.articleSelectors = ['article.has-l-fixed-column'];

	this.talkbackParentClass = 'media__content';
	
	this.talkbackTitleSelectors = ['.cmt__title'];
	
	this.talkbackTextSelectors = ['.cmt__text'];

};

TheMarker.prototype = Object.create(Publisher.prototype);
TheMarker.prototype.constructor = TheMarker;

TheMarker.prototype.uid = 	function() {
	return 'TheMarker';
};

TheMarker.prototype.run = function(rerun) {
	if (!this._allowed()) 
		return;

	this._hideAuthors();
	
	if (!rerun) {
		window.setInterval(this._hideTalkbacks, 1000);
	}
};

TheMarker.prototype._hideAuthors = function() {
	if (!this._allowed()) {
		this.tracker.sendEvent('NotAllowedPage', 'na', 1);
		return;
	}

	chrome.storage.sync.get('zen_options',
						function(items) {
							publisherInstances["TheMarker"]._eraseHiddenAuthors(items.zen_options["TheMarker"]["authors_map"]);
						});

	this.tracker.sendEvent('ScannedPage', window.location.href, 1);
};

TheMarker.prototype._hideTalkbacks = function() {
    
     chrome.storage.sync.get('zen_options',
						function(items) {
                            var self = publisherInstances["TheMarker"];
                            if (items && items.zen_options["TheMarker"]["comments"]) {
                                if (!self._allowed())
                                        return;

                                var allTB = self._getTalkbacks();

                                for (var i = 0; i < allTB.length; i++) {
                                    self._parseTalkback(allTB[i]);
                                }
                            }
                            else {
                                self._revealTalkbacks();
                            }

                            self._updateBadge();
                        });
};



