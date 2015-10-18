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
    var synopsis = this._computeMainTerms();
    
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

Haaretz.prototype._computeMainTerms = function() {
    // Extract all paragraphs, and treat each as a doc, creating a list of such
    var paragraphs = document.querySelectorAll('section.article__entry>p.t-body-text');
    if (!paragraphs || paragraphs.length === 0) {
        return [];
    }
    
    var pArray = Array.prototype.slice.call(paragraphs);
    var docs = [];
    var article = '';
    for (var i = 0; i < pArray.length; i++) {
        var pT = '';
        for (var c = 0; c < pArray[i].childNodes.length; c++) {
            var cN = pArray[i].childNodes[c];
            pT += ' ' + ((cN !== null && cN.data) || (cN.firstChild !== null && cN.firstChild.data));
        }
        
        docs.push(pT.trim());
        article += ' ' + pT;
    }
    
    article = article.trim();
    
    var dataModel = TFIDF_analyze(docs, hebrewStopWords);

    var terms = TFIDF_tokenize(article);
    
    // Stores paragraphs data, per each paragraph
    var pData = {};
    
    for (var j = 0; j < docs.length; j++) {
        var maxTermScore = -1.0;
        var maxTermText = '-';
        for (var k = 0; k < terms.length; k++) {
            
            // Skip term which are stop words
            if (terms[k].length <= 2 || hebrewStopWords.indexOf(terms[k]) >= 0)
                continue;
            
            var tScore = dataModel.tfidf(terms[k], docs[j]);
            if (tScore > 0.0 && tScore > maxTermScore) {
                maxTermScore = tScore;
                maxTermText = terms[k];
            }
        }

        // Store paragraph info
        if (maxTermScore > 0 && docs[j])  {
            pData[j] = { 'text' : docs[j].trim(),
                         'max-term-text' : maxTermText.trim(),
                         'max-term-score': maxTermScore
                       };
        }
    }
    
    var mainTerms = {};
    var synopsis = '';
    var volume = 0;
    
    for (var x = 0; x < Object.keys(pData).length; x++) {
        var pInfo = pData[x];
        
        if (!pInfo || !pInfo["text"] || !pInfo["max-term-text"] || !pInfo["max-term-score"])
            continue;
        
        volume += pInfo["text"].length;
        
        var sentences = pInfo["text"].split(/[.]+/);
        
        mainTerms[pInfo["max-term-score"]]= pInfo["max-term-text"];
        
        var prgT = '';
        for (var y = 0; y < sentences.length; y++) {
            var tokens = TFIDF_tokenize(sentences[y]);
            if (tokens.length >= 20 && sentences[y].indexOf(pInfo["max-term-text"]) !== -1) {
                prgT += sentences[y] + '. ';
                break;
            }
        }
        
        if (prgT.length > 0) {
            prgT = '<p style="padding:2px 52px 2px 20px;">' + prgT + '</p>';
            synopsis += prgT;
        }
    }

    /* DEPRECATED
    var sorted = [];
    for(var key in mainTerms) {
        sorted[sorted.length] = key;
    }
    sorted.sort();
    sorted.reverse();
    
    var termStr = '';
    for (var t = 0; t < sorted.length && t < 3; t++) {
        termStr += '<span class="zen-reader-main-term" style="padding:5px;">' + sorted[t] + ':' + mainTerms[sorted[t]] + '</span>';
    }
    termStr = '<div>' + termStr + '</div>';

    synopsis = termStr + synopsis;
    */

    if (volume === 0 || synopsis.length === 0)
        return null;

    synopsis += '<p style="direction:ltr;position:relative;top:17px;left:-7px;float:left;font-size:11px!important;">&copy; 2015 Synopsis&#8482; by Zen Reader</p>';
    return synopsis;
};

