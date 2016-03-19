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
    
    this._synopsis();
};

TheMarker.prototype._synopsis = function() {
    chrome.storage.sync.get('zen_options',
						  function(items) {
        
                            var self = publisherInstances["TheMarker"];
        
                            if (!items || !items.zen_options["TheMarker"]["labs"]["summarization"]) {
                                self._removeSynopsis(self);
                                return;
                            }

                            var existingSyn = document.getElementById('zen-reader-synopsis');
                            if (existingSyn) {
                                document.removeChild(existingSyn);
                            }

                            var articleFirstParag = document.querySelector('section.article__entry>p.t-body-text');

                            // Place visual queue while computing synopsis
                            var pendingDiv = document.createElement('DIV');
                            pendingDiv.id = 'zen-pending-review';
                            pendingDiv.style.width = '100%';
                            pendingDiv.style.textAlign = 'center';
        
                            var pendingGIF = document.createElement('IMG');
                            pendingGIF.src = 'https://raw.githubusercontent.com/doronsadeh/media/master/zenreader/loading-animated.gif';
                            pendingGIF.style.width = '32px';
                            pendingGIF.style.height = '32px';
                            pendingGIF.id = 'zen-review-pending-GIF';
                            pendingGIF.title = 'Zen Reader בונה תקציר למאמר';

                            pendingDiv.appendChild(pendingGIF);
        
                            articleFirstParag.parentElement.insertBefore(pendingDiv, articleFirstParag);
        
                            var synopsis = self._computeSynopsis(self, 'section.article__entry>p.t-body-text');

                            var bgColor = 'rgba(240,240,240,0.35)';
                            var marginB = '75px';
                            var paddingB = '15px 15px 15px 15px';
                            if (null === synopsis) {
                                bgColor = 'rgba(200,200,200,0.65)';
                                marginB = '10px';
                                var paddingB = '15px 15px 25px 15px';
                                synopsis = "<div>&#1492;&#1502;&#1506;&#1512;&#1499;&#1514; &#1492;&#1495;&#1500;&#1497;&#1496;&#1492; &#1500;&#1488; &#1500;&#1492;&#1510;&#1497;&#1490; &#1505;&#1497;&#1499;&#1493;&#1501; &#1500;&#1502;&#1488;&#1502;&#1512; &#1494;&#1492;. &#1497;&#1514;&#1499;&#1503; &#1513;&#1492;&#1502;&#1488;&#1502;&#1512; &#1511;&#1510;&#1512; &#1493;&#1502;&#1502;&#1510;&#1492;, &#1488;&#1493; &#1513;&#1500;&#1488; &#1504;&#1497;&#1514;&#1503; &#1492;&#1497;&#1492; &#1500;&#1492;&#1508;&#1497;&#1511; &#1505;&#1497;&#1499;&#1493;&#1501; &#1488;&#1497;&#1499;&#1493;&#1514;&#1497; &#1491;&#1497;&#1493;.</div>";
                            }
        
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
                            sChild.style.backgroundColor = bgColor;
                            sChild.style.fontSize = '115%';
                            sChild.id = "zen-reader-synopsis";
                            sChild.classList.add('t-body-text');
                            sChild.style.padding = paddingB;
                            sChild.style.marginBottom = marginB;
        
                            // Put it all together
                            pendingDiv.removeChild(document.getElementById('zen-review-pending-GIF'));
                            pendingDiv.style.textAlign = '';
                            pendingDiv.appendChild(sChild);
    });
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

                                self._hideSubjects(self, subjects);
                            }
                            else {
                                self._revealSubjects(self);
                            }
    });
};
