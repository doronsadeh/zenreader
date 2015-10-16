var TheMarker = function(tracker) {
	
	//
	// Constructor
	//
	
	// Call super
	Publisher.call(this, tracker);
	
	this.allowedDomains = ["themarker.com"];

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
						 "נעה אסטרייכר",
                         "עמירה הס",
                         "אמירה הס"];

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
										 "נעה אסטרייכר":"noa-ast",
                                         "עמירה הס":"amira-hess",
                                         "אמירה הס":"amira-hess"};

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

TheMarker.prototype.run = function(rerun, force) {
	if (!this._allowed()) 
		return;
    
    this.force = force;

	this._hideAuthors();
    
    this._hideSubjectTitle();
	
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

TheMarker.prototype._hideSubjectTitle = function() {
    var subject = document.querySelectorAll('article>header');
    
    if (subject.length !== 1)
        return;
    
    var titleText = '';
    for (var i = 0; i < subject[0].children.length; i++) {
        var c = subject[0].children[i];
        titleText += ' ' + c.firstChild.data;
    }
    
    titleText = titleText.trim();

    var DBG_names = ['אהוד ברק', 'איילת שקד'];
    
    for (var n = 0; n < DBG_names.length; n++) {
        var DBG_name = DBG_names[n];
        if (titleText.indexOf(DBG_name) !== -1) {
            subject[0].style.backgroundColor = 'red';
            break;
        }
    }
};

TheMarker.prototype._hideSubjectTitle = function() {
    chrome.storage.sync.get('zen_options',
						function(items) {
                            var self = publisherInstances["TheMarker"];
                            if (items && items.zen_options["TheMarker"]["labs"]["by-subject"]) {
                                var subjects = document.querySelectorAll(['article>header', 
                                                                         '[class*="t-alpha"]',
                                                                         '[class*="t-beta"]',
                                                                         '[class*="t-gamma"]',
                                                                         '[class*="t-delta"]',
                                                                         '[class*="t-epsilon"]',
                                                                         '[class*="t-zeta"]',
                                                                         '[class*="t-zeta"]>span',
                                                                         '[class*="t-kicker"]',
                                                                         '[class*="mh__teaser"]',
                                                                         '[class*="t-milli"]']);

                                self._hideSubject(self, subjects);
                            }
    });
};
