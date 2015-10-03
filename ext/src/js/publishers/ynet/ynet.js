var Ynet = function(tracker) {
	
	//
	// Constructor
	//
	
	// Call super
	Publisher.call(this, tracker);
	
	this.allowedDomains = ["ynet.co.il"];

	this.authorsList = ['אבאשלך'];

	this.authorsNormalizedXlatTable = {'אבאשלך':'father'};

	this.authorSelectors = ['.nosuchclassever'];

	// Create a uniform name list of authors for tracking
	var dpKeyList = Object.keys(this.authorsNormalizedXlatTable);
	for (var i = 0; i < dpKeyList.length; i++) {
		this.authorsTrackingUniformName[this.authorsNormalizedXlatTable[dpKeyList[i]]] = this.authorsNormalizedXlatTable[dpKeyList[i]];
	}

	for (var j = 0; j < this.authorsList.length; j++) {
		this.authorsRegEx[j] = XRegExp(this.authorsList[j]);
	}
	
	this.negKeywords = {"סמולנ" : 1, 
						"סמולן" : 1, 
						"גזען" : 1,
						"טיפש" : 1, 
						"אידיוט" : 1,
						"טמבל" : 1,
						"נאצי" : 1};
	
	this.talkbackParentClass = 'art_tkb_talkback_details_inner';
	
	this.talkbackTitleSelectors = ['.art_tkb_talkback_title'];
	
	this.talkbackTextSelectors = ['.art_tkb_talkback_content'];

};

Ynet.prototype = Object.create(Publisher.prototype);
Ynet.prototype.constructor = Ynet;

Ynet.prototype.uid = 	function() {
	return 'ynet';
};

Ynet.prototype.run = function(rerun) {
	if (!this._allowed()) 
		return;
	
	this._hideAuthors();
	
	if (!rerun) {
		window.setInterval(this._hideTalkbacks, 1000);
	}
};

Ynet.prototype._hideAuthors = function() {
	if (!this._allowed()) {
		this.tracker.sendEvent('NotAllowedPage', 'na', 1);
		return;
	}

	chrome.storage.sync.get('authors',
						function(items) {
							publisherInstances["Ynet"]._eraseHiddenAuthors(items.authors);
						});

	this.tracker.sendEvent('ScannedPage', window.location.href, 1);
};

Ynet.prototype._hideTalkbacks = function() {
	var self = publisherInstances["Ynet"];
	if (!self._allowed())
			return;
		
		// TODO move to object model
		var allTB = self._getTalkbacks();
		
		for (var i = 0; i < allTB.length; i++) {
			self._parseTalkback(allTB[i]);
		}
};



