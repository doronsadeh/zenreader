var Haaretz = function(tracker) {
	
	//
	// Constructor
	//
	
	// Call super
	Publisher.call(this, tracker);
	
	this.allowedDomains = ["haaretz.co.il"];
    
	this.authorsList = ["מירב ארלוזורוב",
						"מרב ארלוזורוב",
						 "גדעון לוי",
						 "גידעון לוי",
						 "בני ציפר",
						 "עפרי אילני",
						 "עופרי אילני",
						 "רוויטל מדר",
                         "רויטל מדר",
						 "אורי כץ",
						 "אנשיל פפר",
						 "אייל שגיא ביזאוי",
						 "איל שגיא ביזאוי",
						 "הני זוביידה",
						 "הני זובידה",
						 "ציפר",
						 "תהל פרוש",
						 "נחמיה שטרסלר",
						 "שטרסלר",
						 "קרולינה לנדסמן",
						 "צפי סער",
						 "נועה אסטרייכר",
						 "נעה אסטרייכר",
						 "מרב מיכאלי",
						 "מירב מיכאלי",
                         "עמירה הס",
                         "אמירה הס",
                         "מירב אלוש לברון",
                         "מרב אלוש לברון",
                         "אלוש לברון",
                         "אלוש-לברון"];

	this.authorsNormalizedXlatTable = {	 "מירב ארלוזורוב":"merav-arlozorov",
										 "מרב ארלוזורוב":"merav-arlozorov",
										 "גדעון לוי":"gideon-levi",
										 "גידעון לוי":"gideon-levi",
										 "בני ציפר":"benny-tzipper",
										 "עפרי אילני":"ofri-ilani",
                                         "עופרי אילני":"ofri-ilani",
										 "רוויטל מדר":"revital-madar",
                                         "רויטל מדר":"revital-madar",
										 "אורי כץ":"uri-katz",
										 "אנשיל פפר":"anshil-pepper",
										 "אייל שגיא ביזאוי":"eyal-sagie-bizaui",
										 "איל שגיא ביזאוי":"eyal-sagie-bizaui",
										 "הני זוביידה":"hani-zubida",
										 "הני זובידה":"hani-zubida",
										 "ציפר":"benny-tzipper",
										 "תהל פרוש":"tahel-farosh",
										 "נחמיה שטרסלר":"nehamia-shtresler",
										 "שטרסלר":"nehamia-shtresler",
                                         "קרולינה לנדסמן":"carolina-landsman",
										 "צפי סער":"tzafi-saar",
										 "נועה אסטרייכר":"noa-ast",
										 "נעה אסטרייכר":"noa-ast",
										 "מרב מיכאלי":"merav-michaeli",
										 "מירב מיכאלי":"merav-michaeli",
                                         "עמירה הס":"amira-hess",
                                         "אמירה הס":"amira-hess",
                                         "מירב אלוש לברון":"merav-alush-levron",
                                         "מרב אלוש לברון":"merav-alush-levron",
                                         "אלוש לברון":"merav-alush-levron",
                                         "אלוש-לברון":"merav-alush-levron"};

	this.authorSelectors = ['a.t-txt-link', 'address','a>h3[class*="teaser"]>span','a>header>p.pic__caption','address>a[rel="author"]','a>div.media__content>p.t-address','a>h3>span>span.t-kicker','a>article.media>div.media__content>h3>div.t-epsilon'];

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

Haaretz.prototype = Object.create(Publisher.prototype);
Haaretz.prototype.constructor = Haaretz;

Haaretz.prototype.uid = 	function() {
	return 'Haaretz';
};

Haaretz.prototype._climbeToArticle = function(self, element) {
		var e = element;
    
        if (e.tagName === 'A' && e.classList.contains('t-txt-link') && e.parentElement && e.parentElement.tagName === "LI")
            return e.parentElement;
    
		while (e && e !== document.body && e.tagName !== 'ARTICLE') {
			e = e.parentElement;
		}

		if (e && e.tagName === 'ARTICLE')
			return e;

		return null;
};

Haaretz.prototype.run = function(rerun, force) {
	if (!this._allowed()) 
		return;
    
    this.force = force;

	this._hideAuthors();
	
    this._hideSubjectTitle();
    
	if (!rerun) {
		window.setInterval(this._hideTalkbacks, 1000);
	}

    this._synopsis();
};

Haaretz.prototype._synopsis = function() {
    chrome.storage.sync.get('zen_options',
						function(items) {
                            
                            var self = publisherInstances["Haaretz"];
                            
                            if (!items || !items.zen_options["Haaretz"]["labs"]["summarization"]) {
                                self._removeSynopsis(self);
                                return;
                            }

                            var existingSyn = document.getElementById('zen-reader-synopsis');
                            if (existingSyn) {
                                document.removeChild(existingSyn);
                            }

                            var synopsis = self._computeSynopsis(self, 'section.article__entry>p.t-body-text');

                            if (null !== synopsis) {
                                var articleFirstParag = document.querySelector('section.article__entry>p.t-body-text');

                                var logo = document.createElement('IMG');
                                logo.src = 'https://raw.githubusercontent.com/doronsadeh/media/master/zenreader/icon48.png';
                                logo.style.width = '32px';
                                logo.style.height = 'auto';
                                logo.style.margin = '5px 5px 5px 15px';

                                var logoSpan = document.createElement('SPAN');
                                logoSpan.appendChild(logo);
                                logoSpan.style.float = 'right';

                                var sChild = document.createElement("P");

                                sChild.appendChild(logoSpan);

                                sChild.innerHTML += synopsis;
                                sChild.style.backgroundColor = 'rgba(0,255,0,0.25)';
                                sChild.style.fontSize = '90%';
                                sChild.id = "zen-reader-synopsis";
                                sChild.classList.add('t-body-text');
                                sChild.style.padding = '15px';
                                sChild.style.marginBottom = '50px';

                                // Put it all together
                                articleFirstParag.parentElement.insertBefore(sChild, articleFirstParag);
                            }
    });
}

Haaretz.prototype._hideAuthors = function() {
	if (!this._allowed()) {
		this.tracker.sendEvent('NotAllowedPage', 'na', 1);
		return;
	}

	chrome.storage.sync.get('zen_options',
						function(items) {
							publisherInstances["Haaretz"]._eraseHiddenAuthors(items.zen_options["Haaretz"]["authors_map"]);
						});

	this.tracker.sendEvent('ScannedPage', window.location.href, 1);
};

Haaretz.prototype._hideTalkbacks = function() {
    chrome.storage.sync.get('zen_options',
						function(items) {
                            var self = publisherInstances["Haaretz"];
                            if (items && items.zen_options["Haaretz"]["comments"]) {
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

Haaretz.prototype._hideSubjectTitle = function() {
    chrome.storage.sync.get('zen_options',
						function(items) {
                            var self = publisherInstances["Haaretz"];
        
                            if (items && items.zen_options["Haaretz"]["labs"]["by-subject"]) {
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

                                self._hideSubjects(self, subjects);
                            }
                            else {
                                self._revealSubjects(self);
                            }
    });
};

