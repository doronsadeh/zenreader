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
    
    // DEBUG
    var synopsis = this._computeMainTerms();
    
    var articleHeader = document.querySelectorAll('article>header');
    if (articleHeader.length === 1) {
        var logo = document.createElement('IMG');
        logo.src = 'https://raw.githubusercontent.com/doronsadeh/media/master/zenreader/icon48.png';
        logo.style.width = '32px';
        logo.style.height = 'auto';
        logo.style.margin = '5px 5px 5px 15px';

        var logoSpan = document.createElement('SPAN');
        logoSpan.appendChild(logo);
        logoSpan.style.float = 'right';

        var sChild = document.createElement("DIV");
        
        sChild.appendChild(logoSpan);

        sChild.innerHTML += synopsis;
        sChild.style.backgroundColor = 'rgba(255,255,0,0.4)';
        sChild.style.padding = '10px 10px 10px 5px';
        sChild.style.margin = '10px 0px 10px 0px';
        sChild.id = "zen-reader-synopsis";
        
        // Put it all together
        articleHeader[0].appendChild(sChild);
    }
};

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
            pData[j] = { 'text' : docs[j],
                         'max-term-text' : maxTermText,
                         'max-term-score': maxTermScore
                       };
        }
    }
    
    var synopsis = '';
    for (var x = 0; x < Object.keys(pData).length; x++) {
        var pInfo = pData[x];
        
        var sentences = pInfo["text"].split(/[.!?]+/);
        synopsis += '<div style="padding-bottom:2px;">';
        for (var y = 0; y < sentences.length; y++) {
            var tokens = TFIDF_tokenize(sentences[y]);
            if (tokens.length >= 7 && sentences[y].indexOf(pInfo["max-term-text"]) !== -1) {
                synopsis += sentences[y] + '. ';
                break;
            }
        }
        synopsis += '</div>';
    }
    
    return synopsis;
};

var hebrewStopWords = [
    'אני',
    'את',
    'אתה',
    'אנחנו',
    'אתן',
    'אתם',
    'הם',
    'הן',
    'היא',
    'הוא',
    'שלי',
    'שלו',
    'שלך',
    'שלה',
    'שלנו',
    'שלכם',
    'שלכן',
    'שלהם',
    'שלהן',
    'לי',
    'לו',
    'לה',
    'לנו',
    'לכם',
    'לכן',
    'להם',
    'להן',
    'אותה',
    'אותו',
    'זה',
    'זאת',
    'אלה',
    'אלו',
    'תחת',
    'מתחת',
    'מעל',
    'בין',
    'עם',
    'עד',
    'נגר',
    'על',
    'אל',
    'מול',
    'של',
    'אצל',
    'כמו',
    'אחר',
    'אותו',
    'בלי',
    'לפני',
    'אחרי',
    'מאחורי',
    'עלי',
    'עליו',
    'עליה',
    'עליך',
    'עלינו',
    'עליכם',
    'לעיכן',
    'עליהם',
    'עליהן',
    'כל',
    'כולם',
    'כולן',
    'כך',
    'ככה',
    'כזה',
    'זה',
    'זות',
    'אותי',
    'אותה',
    'אותם',
    'אותך',
    'אותו',
    'אותן',
    'אותנו',
    'ואת',
    'את',
    'אתכם',
    'אתכן',
    'איתי',
    'איתו',
    'איתך',
    'איתה',
    'איתם',
    'איתן',
    'איתנו',
    'איתכם',
    'איתכן',
    'יהיה',
    'תהיה',
    'היתי',
    'היתה',
    'היה',
    'להיות',
    'עצמי',
    'עצמו',
    'עצמה',
    'עצמם',
    'עצמן',
    'עצמנו',
    'עצמהם',
    'עצמהן',
    'מי',
    'מה',
    'איפה',
    'היכן',
    'במקום שבו',
    'אם',
    'לאן',
    'למקום שבו',
    'מקום בו',
    'איזה',
    'מהיכן',
    'איך',
    'כיצד',
    'באיזו מידה',
    'מתי',
    'בשעה ש',
    'כאשר',
    'כש',
    'למרות',
    'לפני',
    'אחרי',
    'מאיזו סיבה',
    'הסיבה שבגללה',
    'למה',
    'מדוע',
    'לאיזו תכלית',
    'כי',
    'יש',
    'אין',
    'אך',
    'מנין',
    'מאין',
    'מאיפה',
    'יכל',
    'יכלה',
    'יכלו',
    'יכול',
    'יכולה',
    'יכולים',
    'יכולות',
    'יוכלו',
    'יוכל',
    'מסוגל',
    'לא',
    'רק',
    'אולי',
    'אין',
    'לאו',
    'אי',
    'כלל',
    'נגד',
    'אם',
    'עם',
    'אל',
    'אלה',
    'אלו',
    'אף',
    'על',
    'מעל',
    'מתחת',
    'מצד',
    'בשביל',
    'לבין',
    'באמצע',
    'בתוך',
    'דרך',
    'מבעד',
    'באמצעות',
    'למעלה',
    'למטה',
    'מחוץ',
    'מן',
    'לעבר',
    'מכאן',
    'כאן',
    'הנה',
    'הרי',
    'פה',
    'שם',
    'אך',
    'ברם',
    'שוב',
    'אבל',
    'מבלי',
    'בלי',
    'מלבד',
    'רק',
    'בגלל',
    'מכיוון',
    'עד',
    'אשר',
    'ואילו',
    'למרות',
    'אס',
    'כמו',
    'כפי',
    'אז',
    'אחרי',
    'כן',
    'לכן',
    'לפיכך',
    'מאד',
    'עז',
    'מעט',
    'מעטים',
    'במידה',
    'שוב',
    'יותר',
    'מדי',
    'גם',
    'כן',
    'נו',
    'אחר',
    'אחרת',
    'אחרים',
    'אחרות',
    'אשר',
    'או'
];