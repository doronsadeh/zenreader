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
	_climbeToArticle : function(element) {
		var e = element;
		while (e && e !== document.body && e.tagName !== 'ARTICLE') {
			e = e.parentElement;
		}

		if (e && e.tagName === 'ARTICLE')
			return e;

		return null;
	},
    
    _handleFullArticle : function(articleElement, author) {
        
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
            replace.innerHTML = "Zen Reader &#1492;&#1505;&#1514;&#1497;&#1512; &#1499;&#1514;&#1489;&#1492; &#1502;&#1488;&#1514; " + author;
            replace.style.direction = "rtl";
            replace.style.padding = "20px";
            replace.style.paddingTop = "50px";
            replace.style.textAlign = "center";
            replace.style.width = '100%';
            replace.className = "zen-reader-full-article";
            
            var logo = document.createElement('IMG');
            logo.src = 'https://raw.githubusercontent.com/doronsadeh/media/master/zenreader/icon48.png';
            logo.style.width = '64px';
            logo.style.height = 'auto';
            
            var logoDiv = document.createElement('DIV');
            logoDiv.appendChild(logo);
            logoDiv.style.width = '100%';
            logoDiv.style.marginTop = '50px';
            
            
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
			var author = authorz[z].firstChild;

            if (!author) 
                continue;
            
			var actualAuthorString = '';
			if (typeof author.data != 'undefined') {
				actualAuthorString = author.data;
			}
			else if (typeof author.firstChild != 'undefined' && typeof author.firstChild.data != 'undefined') {
				actualAuthorString = author.firstChild.data;
			}
			
			actualAuthorString = actualAuthorString.replace(/\s+/g, ' ');

			for (var a = 0; a < this.authorsRegEx.length; a++) {

				var candidates = this.authorsRegEx[a].exec(actualAuthorString);
				for (var y = 0; candidates !== null && y < candidates.length; y++) {

					var candidate = candidates[y];

					var articleToHide = this._climbeToArticle(authorz[z]);

					var toHide = this._isHide(authorsMap, this.authorsNormalizedXlatTable, candidate);
					if (toHide && this.authorsRegEx[a].test(candidate)) {
						// Hide only if not already hidden
						if (articleToHide !== null) {
                            // Mark full article we hide with the Zen sign
                            this._handleFullArticle(articleToHide, candidate);
                            
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