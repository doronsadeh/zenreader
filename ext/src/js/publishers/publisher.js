var Publisher = function(tracker) {
	 
	 //
	 // Constructor
	 //
	 
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