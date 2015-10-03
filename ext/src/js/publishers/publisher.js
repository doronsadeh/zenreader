var Publisher = function(tracker) {
	 
	 //
	 // Constructor
	 //

	// REmoved articles counter and snapshot
 	this.copyModified = -1;
	this.modified = 0;
	 
	 // The set of domains this publisher owns
	 this.allowedDomains = [];
	 
	 // GA tracker 
	 this.tracker = tracker;
	 
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

	// @protected _eraseHiddenAuthors
	//
	// Erases all articles by hidden authors
	//
	// Returns: nothing
	_eraseHiddenAuthors : function(authorsMap) {
		
		// For tracking
		var blockedAuthorsDict = {};

		this.modified = 0;

		var authorz = document.querySelectorAll(this.authorSelectors);
		
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
	
	// @public uid
	//
	// Returns: unique class id
	uid : function() {
		return 'publisher';
	},
	
	run : function(rerun) {
		console.error('run must be implemented, cannot use base class');
	}
};