var Publisher = function(tracker) {
	 
	 //
	 // Constructor
	 //

 	///////////////////////////////////////////////
	//
	// Articles 
	//
	//

	// Removed articles counter and snapshot
 	this.modifiedArticlesLast = -1;
	this.modifiedArticles = 0;

    // Removed talkbacks counter and snapshot
 	this.modifiedCommentsLast = -1;
	this.modifiedComments = 0;
	 
    // Force to re-calc and show badge info (one shot, reset on used)
    this.force = false;
    
	 // The set of domains this publisher owns
	 this.allowedDomains = [];
	 
	 // GA tracker 
	 this.tracker = tracker;
	 
     // TODO chnage this to fullArticlesSelectors
     // A set of CSS selectors idetifying article elements within the publisher domains
	 this.articleSelectors = [];
	 
	 // A set of CSS selectors idetifying authors elements within the publisher domains
	 // We assume author element MUST be a direct, or non-direct decendant of article elements
	 this.authorSelectors = [];
	 
	 // A list of all author names, including shorthands, alternative spelling, etc. Hence this
	 // list MAY include duplicate representations of the same author, e.g. 'Sam Weiss', 'Weiss'
	 // Names on the list are UTF-8 encoded in the publisher local language
	 this.authorsList = [];
	 
	 // A dictionary whose keys are all the authors' names from authorsList, and values are the mapping
	 // of each name to its normalized english form, e.g. {"Sam Weiss" : "sam-weiss", "Weiss" : "sam-weiss"}
	 this.authorsNormalizedXlatTable = {};

	// Authors built unifor names for tracking purposes (built by sub-class constructor)
 	this.authorsTrackingUniformName = {};
	
	// Authors reg exps (built by sub-class constructor)
	this.authorsRegEx = [];
	
	
	///////////////////////////////////////////////
	//
	// Talkbacks 
	//
	//
	
	// Talkback parent class
	this.talkbackParentClass = '';
	
	// Talkback title CSS selector(s)
	this.talkbackTitleSelectors = [];
	
	// Talkback text CSS selector(s)
	this.talkbackTextSelectors = [];
	
	// Talkbacks neg words
    this.talkbackNegKeywords = {"סמולנ" : 1, 
								"סמולן" : 1, 
								"0מולן" : 1,
								"גזען" : 1,
								"טיפש" : 1, 
								"אידיוט" : 1,
								"טמבל" : 1,
								"נאצי" : 1,
								"דביל" : 1,
								"מפגר" : 1,
								"חחח" : 1};
};	

Publisher.prototype = {
	//
	// Methods
	// 
	 
	// @protected _allowed
	//
	// Checks if the current window loaction is in one of the publisher's domains
	//
	// Returns: true if the current window location is within one of the publisher allowed domains 
	_allowed : function() {
		for (var i = 0; i < this.allowedDomains.length; i++) {
			if (window.location.hostname.endsWith(this.allowedDomains[i]))
				return true;
		}

		return false;
	},
	
    ///////////////////////////////////////////////
    //
    // Synopsis
    //
    //
    
    _text : function(self, node, limit) {
        if (limit < 0)
            return '';

        if (node && node.data && typeof node.data === 'string')
            return node.data.trim();

        var t = '';
        for (var c = 0; c < node.childNodes.length; c++) {
            t += ' ' + self._text(self, node.childNodes[c], limit-1);
        }

        return t.trim();
    },
        
    _computeMainTerms : function(self, prgSelector) {
        // Extract all paragraphs, and treat each as a doc, creating a list of such
        var paragraphs = document.querySelectorAll(prgSelector);
        if (!paragraphs || paragraphs.length === 0) {
            return [];
        }

        var pArray = Array.prototype.slice.call(paragraphs);
        var docs = [];
        var article = '';
        for (var i = 0; i < pArray.length; i++) {
            var pT = self._text(self, pArray[i], 3);
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

        var synLength = TFIDF_tokenize(synopsis).length;
        var articleLength = TFIDF_tokenize(article).length;
        var synRatio = synLength/articleLength;
        if (articleLength > 0 && synRatio >= 0.5)
            return null;

        synopsis += '<p style="direction:ltr;position:relative;top:17px;left:-7px;float:left;font-size:11px!important;">&copy; 2015 Zynopsis&#8482; by Zen Reader (saved <strong>' + Math.round((1.0-synRatio)*100) + '%</strong> of your reading time)</p>';
        return synopsis;
    },
    
	///////////////////////////////////////////////
	//
	// Articles 
	//
	//
	
	// @protected _normalizeAuthor
	//
	// Returns: the normalized author name
	_normalizeAuthor : function(authorsNormalizedXlatTable, author) {
		return this.authorsNormalizedXlatTable[author];
	},

	// @protected _isHide
	//
	// Returns: true if the author should be hidden
	_isHide : function(authorsMap, authorsNormalizedXlatTable, author) {
		var authorKey = this.authorsNormalizedXlatTable[author];
		if (authorKey) {
			return authorsMap[authorKey];
		}

		return false;
	},
	
	// @protected _climbeToArticle
	//
	// Returns: the article element whose a direct or non-direct parent of 'element', 
	//          or null if no such element
	_climbeToArticle : function(self, element) {
		var e = element;
		while (e && e !== document.body && e.tagName !== 'ARTICLE') {
			e = e.parentElement;
		}

		if (e && e.tagName === 'ARTICLE')
			return e;

		return null;
	},
    
    _handleFullArticle : function(articleElement, prefix, person) {
        
        var fullArticle = false;
        
        var articles = document.querySelectorAll(this.articleSelectors);
        for (var i = 0; i < articles.length; i++) {
            if (articles[i].isSameNode(articleElement)) {
                fullArticle = true;
                break;
            }
        }
        
        if (fullArticle && articleElement.parentElement && !articleElement.parentElement.querySelector('.zen-reader-full-article')) {
            var replace = document.createElement('DIV');
            replace.innerHTML = "Zen Reader &#1492;&#1505;&#1514;&#1497;&#1512; &#1499;&#1514;&#1489;&#1492; " + prefix + person;
            replace.style.direction = "rtl";
            // replace.style.padding = "20px";
            replace.style.paddingTop = "15px";
            replace.style.textAlign = "center";
            replace.style.width = '100%';
            // replace.style.backgroundColor = '#FFE';
            replace.className = "zen-reader-full-article";
            
            var logo = document.createElement('IMG');
            logo.src = 'https://raw.githubusercontent.com/doronsadeh/media/master/zenreader/icon48.png';
            // logo.style.width = '64px';
            logo.style.height = 'auto';
            
            var logoDiv = document.createElement('DIV');
            logoDiv.appendChild(logo);
            logoDiv.style.width = '100%';
            logoDiv.style.marginTop = '10px';
            logoDiv.style.marginBottom = '10px';
                        
            replace.appendChild(logoDiv);
            
            articleElement.parentElement.appendChild(replace);
        }
        
        return fullArticle;
    },

	// @protected _eraseHiddenAuthors
	//
	// Erases all articles by hidden authors
	//
	// Returns: nothing
	_eraseHiddenAuthors : function(authorsMap) {
		
        // Remove any full article hide marker from the page
        var fullArticleHideElements = document.querySelectorAll('.zen-reader-full-article');
        for (var x = 0; x < fullArticleHideElements.length; x++) {
            fullArticleHideElements[x].remove();
        }
        
		// For tracking
		var blockedAuthorsDict = {};

		var authorz = document.querySelectorAll(this.authorSelectors);
		
		for (var z = 0; z < authorz.length; z++) {
            
            for (var c = 0; c < authorz[z].childNodes.length; c++) {
                
                var author = authorz[z].childNodes[c];

                if (!author) 
                    continue;

                var actualAuthorString = '';
                if (typeof author.data != 'undefined') {
                    actualAuthorString = author.data;
                }
                else if (author.firstChild && typeof author.firstChild != 'undefined' && typeof author.firstChild.data != 'undefined') {
                    actualAuthorString = author.firstChild.data;
                }

                actualAuthorString = actualAuthorString.replace(/\s+/g, ' ');

                if (actualAuthorString.length === 0)
                    continue;
                
                for (var a = 0; a < this.authorsRegEx.length; a++) {

                    var candidates = this.authorsRegEx[a].exec(actualAuthorString);
                    for (var y = 0; candidates !== null && y < candidates.length; y++) {

                        var candidate = candidates[y];

                        var articleToHide = this._climbeToArticle(this, authorz[z]);

                        var toHide = this._isHide(authorsMap, this.authorsNormalizedXlatTable, candidate);
                        
                        if (toHide && this.authorsRegEx[a].test(candidate)) {
                            // Hide only if not already hidden
                            if (articleToHide !== null) {
                                // Mark full article we hide with the Zen sign
                                this._handleFullArticle(articleToHide, '&#1502;&#1488;&#1514; ', candidate);

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
		
        // Send each author and its numbers of blocks
        var kl = Object.keys(this.authorsTrackingUniformName);
        for (var r = 0; r < kl.length; r++) {
            if (blockedAuthorsDict[this.authorsTrackingUniformName[kl[r]]] > 0) {
                this.tracker.sendEvent('BlockedAuthorOnPage', this.authorsTrackingUniformName[kl[r]], blockedAuthorsDict[this.authorsTrackingUniformName[kl[r]]]);
            }
        }
        
        this._updateBadge();
	},

	// @protected hideAuthors
	//
	// Activates the author hiding process, either as a one time, or on going.
	// Whether this is one-time scan (assuming extension is loaded on DOM completion), 
	// or a repeating scan is up to the specific publisher sub-class impl.
	// 
	// Returns: nothing
	_hideAuthors : function() {
		console.error('_blockAuthors must be implemented, cannot use base class');
	},
	
	
	///////////////////////////////////////////////
	//
	// Talkbacks 
	//
	//
	
    // _scoreWord
    //
    // Get a single word, and returns a score in [0,1], where higher is worse, i.e. the word
    // is violent/abusive/misspelled/junk, etc.
    _scoreWord : function(word) {
        word = word.trim();
        var ls = word.split('');
        var h = {};
        for (var i = 0; i < ls.length; i++) {
            var l = ls[i];
            if (h[l]) {
                h[l] += 1;
            }
            else {
                h[l] = 1;
            }
        }
        
        // Return the max norm of the histogram vector as score
        for (var i = 0; i < ls.length; i++) {
            var l = ls[i];
            if (h[l] / ls.length > 0.5)
                return 1;
        }
        
        return 0;
    },
    
    _scoreSentence : function(words) {
        var sum = 0;
        for (var i = 0; i < words.length; i++) {
            if (words[i].length > 3) {
                var score = this._scoreWord(words[i]);
                sum += score;
            }
        }
        
        return (sum / words.length);
    },
    
	_countStrongPunctMarks : function(word) {
		return word.replace(/[^!?]/g, "").length;
	},

	_isNegWord : function(word) {
		nWs = Object.keys(this.talkbackNegKeywords);
		for (var i = 0; i < nWs.length; i++) {
			if (word.indexOf(nWs[i]) !== -1)
				return true;
		}
		
		return false;
	},
    
    _updateBadge : function() {

        var modified = false;
        
        this.modifiedArticles = document.querySelectorAll('[data-zenreader-hide-article]').length;
		if (this.modifiedArticles !== this.modifiedArticlesLast) {
			this.modifiedArticlesLast = this.modifiedArticles;
            modified = true;
        }
        
        this.modifiedComments = document.querySelectorAll('[zenreader-hidden-talkback]').length;
		if (this.modifiedComments !== this.modifiedCommentsLast) {
			this.modifiedCommentsLast = this.modifiedComments;
            modified = true;
        }

        if (modified || this.force) {
            this.force = false;
			chrome.runtime.sendMessage({incr: this.modifiedArticles, 
                                       comments: this.modifiedComments}, 
                                       function(response) {
			});
        }
    },

    _revealTalkbacks : function() {
        var higlightedTalkbacksParents = document.querySelectorAll('[zenreader-hidden-talkback]');
        for (var i = 0; i < higlightedTalkbacksParents.length; i++) {
            var tParent = higlightedTalkbacksParents[i];
            tParent.innerHTML = window.decodeURI(tParent.getAttribute('zenreader-hidden-talkback'));
            tParent.removeAttribute('zenreader-hidden-talkback');
            tParent.style.backgroundColor = '';
        }
    },
    
	_hideTalkback : function(talkback) {
		// Set highlight just before we remove it so when its clicked we already have it
		talkback.element.style.backgroundColor = 'rgba(255,255,0,0.4)';
		
		var h = '48px';
		var lM = '58px';
		var lH = '42px';
		if (talkback.element.getClientRects()[0]) {
			h = (talkback.element.getClientRects()[0].height * 0.75) + 'px';
			lM = ((talkback.element.getClientRects()[0].height * 0.75) + 10) + 'px';
			lH = ((talkback.element.getClientRects()[0].height * 0.75) - 5) + 'px';
		}
		
		var oldIHb64 = window.encodeURI(talkback.element.innerHTML);
		talkback.element.innerHTML = "<div class='zenreader-comment' onclick='(function(){parentNode.innerHTML = window.decodeURI(parentNode.getAttribute(\"zenreader-hidden-talkback\"));})()'><img src='https://raw.githubusercontent.com/doronsadeh/media/master/zenreader/icon48.png' style='width: auto; height:" +  h + ";'><div style='text-shadow:white 0 1px 2px;padding-right:" + lM + ";bottom:" + lH + ";position: relative;'><strong>Zen Reader</strong>, &#1492;&#1505;&#1514;&#1497;&#1512; &#1514;&#1490;&#1493;&#1489;&#1492; &#1494;&#1493; &#1499;&#1491;&#1497; &#1500;&#1513;&#1502;&#1493;&#1512; &#1506;&#1500; &#1513;&#1500;&#1493;&#1493;&#1514;&#1499;&#1501; (&#1500;&#1497;&#1495;&#1510;&#1493; &#1499;&#1491;&#1497; &#1500;&#1490;&#1500;&#1493;&#1514; &#1488;&#1514; &#1492;&#1514;&#1490;&#1493;&#1489;&#1492; &#1513;&#1492;&#1493;&#1505;&#1514;&#1512;&#1492;).</div></div>";
		talkback.element.setAttribute('zenreader-hidden-talkback', oldIHb64);
	},

	_talkbackTouched : function(talkback) {
		if (talkback.element.hasAttribute('zenreader-hidden-talkback')) {
			return true;
		}
		
		return false;
	},
	
	_parseTalkback : function(talkback) {
		
		// TODO do we need to diff between hidden and flipped?
		if (this._talkbackTouched(talkback))
			return;

        var trimmedTTL = talkback.title.trim();
        var trimmedTXT = talkback.text.trim();
        if (trimmedTTL.length === 0 && trimmedTXT.length === 0) {
            return;
        }
        
		var titleWords = trimmedTTL.split(' ');
		var textWords = trimmedTXT.split(' ');
        
		var kill = false;
		
		var countOffendingTitle = 0;
		var countOffendingText = 0;
		var maxSingleWord = 0;
		var countNegWords = 0;
		
		for (var i = 0; i < titleWords.length; i++) {
			var o = this._countStrongPunctMarks(titleWords[i]);
			if (o > 1)
				countOffendingTitle += 1;
			
			maxSingleWord = Math.max(maxSingleWord, o);
			
			if (this._isNegWord(titleWords[i]))
				countNegWords += 1;
		}

		for (var j = 0; j < textWords.length; j++) {
			var p = this._countStrongPunctMarks(textWords[j]);
			if (p > 1)
				countOffendingText += 1;
			
			maxSingleWord = Math.max(maxSingleWord, p);
			
			if (this._isNegWord(textWords[j]))
				countNegWords += 1;
		}
		
		var ratioTitle = countOffendingTitle / titleWords.length;
		var ratioText = countOffendingText / textWords.length;
		
        var ttlWordsScrore = this._scoreSentence(titleWords);
        var txtWordsScore = this._scoreSentence(textWords);
		
        // TODO tunes this and add word based classifiers
		if (maxSingleWord > 2         || 
            ratioTitle > 0.1          || 
            ratioText > 0.15          || 
            countNegWords >= 1        || 
            ttlWordsScrore > 0.3      || 
            txtWordsScore > 0.3) {
			this._hideTalkback(talkback);
		}
	},

	_getTalkbacks : function() {
		// Get all titles
		var allTBTitles = document.querySelectorAll(this.talkbackTitleSelectors);
		
		// Ready a list of all talkbacks (objects)
		var talkbacks = [];
		
		for (var i = 0; i < allTBTitles.length; i++) {
			// Get texts
			var p = allTBTitles[i].parentNode;
			while (p && p !== document.body && !p.classList.contains(this.talkbackParentClass)) {
				// Just go up
				p = p.parentNode;
			}
			
			if (p && p.classList.contains(this.talkbackParentClass)) {
				var textNode = p.querySelector(this.talkbackTextSelectors);
				try {
					var talkB = null;
					
					var ttl = '';
					var txt = '';
					
					if (allTBTitles[i] && allTBTitles[i].firstChild && allTBTitles[i].firstChild.data)
						ttl = allTBTitles[i].firstChild.data;
					
					if (textNode && textNode.firstChild && textNode.firstChild.data)
						txt = textNode.firstChild.data;
					
					talkB = {'title' : ttl, 'text' : txt, 'element' : p };
					talkbacks.push(talkB);

				} catch (e) {
					console.log('Malformed talkback: ', allTBTitles[i], textNode);
				}
			}
		}
		
		return talkbacks;
	},
    
    _revealSubjects(self) {
        var bySubject = document.querySelectorAll('[data-zenreader-hide-by-subject]');
        
        for (var i = 0; i < bySubject.length; i++) {
            bySubject[i].style.setProperty('display', '', '');
            bySubject[i].removeAttribute('data-zenreader-hide-by-subject');
            bySubject[i].removeAttribute('data-zenreader-hide-article');
        }
        
        self._updateBadge();
    },

    _removeSynopsis(self) {
        var synPrgs = document.querySelectorAll('#zen-reader-synopsis');
        
        for (var i = 0; i < synPrgs.length; i++) {
            if (synPrgs[i].parentElement)
                synPrgs[i].parentElement.removeChild(synPrgs[i]);
        }
    },

    _hideSubjects(self, subjects) {
        for (var s = 0; s < subjects.length; s++) {
            var subject = subjects[s];
            var titleText = '';

            try {

                for (var i = 0; i < subject.childNodes.length; i++) {
                    var c = subject.childNodes[i];
                    try {
                        titleText += ' ' + c.firstChild.data;
                    } catch (e) {
                        // Quiet
                    }
                }

                if (titleText.length === 0) {
                    titleText += subject.firstChild.data;
                    titleText += subject.nextSibling.data;
                }

            } catch(e) {
                // Quiet
            }

            titleText = titleText.trim();

            var DBG_names = ['אייל גולן','טרור','פיגוע','פצועים','הרוגים','מחבל','מפגע','הרוג','פצוע','דקירה','דקירות','דריסה','דורס','המצב הבטחוני','המצב הביטחוני','מצב בטחוני','למצב הבטחוני','מצב ביטחוני'];

            for (var n = 0; n < DBG_names.length; n++) {
                var DBG_name = DBG_names[n];
                if (titleText.indexOf(DBG_name) !== -1) {
                    var a = self._climbeToArticle(self, subject);
                    if (null !== a) {
                        a.style.setProperty('display', 'none', 'important');
                        a.setAttribute('data-zenreader-hide-article','true');
                        a.setAttribute('data-zenreader-hide-by-subject','true');
                        self._handleFullArticle(a, '&#1492;&#1506;&#1493;&#1505;&#1511;&#1514; &#1489;', DBG_name);
                    }
                    break;
                }
            }
        }
    },
	
	// @protected hideTalkbacks
	//
	// Activates the talkbacks hiding process, either as a one time, or on going.
	// Whether this is one-time scan (assuming extension is loaded on DOM completion), 
	// or a repeating scan is up to the specific publisher sub-class impl.
	// 
	// Returns: nothing
	_hideTalkbacks : function() {
		console.error('_blockTalkbacks must be implemented, cannot use base class');
	},

    ///////////////////////////////////////////////
    //
    // Subjects
    //
    //
    _hideSubjectTitle : function() {
		console.error('_hideSubjectTitle must be implemented, cannot use base class');
    },
    
	///////////////////////////////////////////////
	//
	// API 
	//
	//
	
	// @public uid
	//
	// Returns: unique class id
	uid : function() {
		return 'publisher';
	},
	
	// @public run
	//
	// Runs the publisher logic (i.e. hide authors, talkbacks, etc.)
	//
	// Returns: nothing
	run : function(rerun, force) {
		console.error('run must be implemented, cannot use base class');
	}
};