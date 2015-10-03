var Ynet = function(tracker) {
	
	//
	// Constructor
	//
	
	// Call super
	Publisher.call(this, tracker);
	
	this.allowedDomains = ["ynet.co.il"];

	this.authorsList = ['רון בן ישי', 'רון  בן-ישי', 'יועז הנדל', 'איתי גל'];

	this.authorsNormalizedXlatTable = {'רון בן ישי':'ron-ben-yishai',
									   'רון בן-ישי' : 'ron-ben-yishai',
									   'יועז הנדל' : 'yoaz-hendel',
									   'איתי גל' : 'itay-gal'};

	this.authorSelectors = ['span.art_header_footer_author>span>a', 'span.mta_gray_text'];

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
	
	this.talkbackParentClass = 'art_tkb_talkback';
	
	this.talkbackTitleSelectors = ['.art_tkb_talkback_title'];
	
	this.talkbackTextSelectors = ['.art_tkb_talkback_content'];

};

Ynet.prototype = Object.create(Publisher.prototype);
Ynet.prototype.constructor = Ynet;

Ynet.prototype._climbeToArticle = function(element) {
	if (element.classList.contains('mta_gray_text') && element.parentElement && element.parentElement.tagName === 'LI') {
		return element.parentElement;
	}
	else if (element.tagName === 'A' && element.parentElement && element.parentElement.tagName === 'SPAN') {
		return document.querySelector('.block.B4.spacer');
	}
	
	return null;
};

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

	// Hide all FB comments (TODO provide an option to enable them back)
	var fbComments = document.getElementById('articleComments');
	fbComments.style.setProperty('display', 'none', 'important');
		
	var allTB = self._getTalkbacks();
		
	for (var i = 0; i < allTB.length; i++) {
		self._parseTalkback(allTB[i]);
	}
};



