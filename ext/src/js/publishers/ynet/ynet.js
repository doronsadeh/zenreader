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
	
	this.talkbackParentClass = 'art_tkb_talkback';
	
	this.talkbackTitleSelectors = ['.art_tkb_talkback_title'];
	
	this.talkbackTextSelectors = ['.art_tkb_talkback_content'];

	this.talkbackIdRegExp = XRegExp('[0-9]+');
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

Ynet.prototype._talkbackTouched = function(talkback) {
	if (talkback.element.hasAttribute('zenreader-hidden-talkback')) {
		return true;
	}
	
	var idU = null;
	if (talkback.element.id)
		idU = this.talkbackIdRegExp.exec(talkback.element.id);
	
	if (null !== idU) {
		var c = document.querySelectorAll('div[id*="' + idU + '"]');
		for (var i = 0; i < c.length; i++) {
			if (c[i].hasAttribute('zenreader-hidden-talkback')) {
				return true;
			}
		}
	}
	
	return false;

};

Ynet.prototype._hideTalkback = function(talkback) {
	
	var idU = null;
	if (talkback.element.id)
		idU = this.talkbackIdRegExp.exec(talkback.element.id);
	
	var c = document.querySelectorAll('div[id*="' + idU + '"]');

	for (var i = 0; i < c.length; i++) {
		// Set highlight just before we remove it so when its clicked we already have it
		c[i].style.backgroundColor = 'rgba(255,255,0,0.4)';
		
		var h = '48px';
		var lM = '58px';
		var lH = '42px';
		if (c[i].getClientRects()[0]) {
			h = (c[i].getClientRects()[0].height * 0.75) + 'px';
			lM = ((c[i].getClientRects()[0].height * 0.75) + 10) + 'px';
			lH = ((c[i].getClientRects()[0].height * 0.75) - 5) + 'px';
		}
		
		var oldIHb64 = window.encodeURI(c[i].innerHTML);
		c[i].innerHTML = "<div class='zenreader-comment' onclick='(function(){parentNode.innerHTML = window.decodeURI(parentNode.getAttribute(\"zenreader-hidden-talkback\"));})()'><img src='https://raw.githubusercontent.com/doronsadeh/media/master/zenreader/icon48.png' style='width: auto; height:" +  h + ";'><div style='text-shadow:white 0 1px 2px;padding-right:" + lM + ";bottom:" + lH + ";position: relative;'><strong>Zen Reader</strong>, &#1492;&#1505;&#1514;&#1497;&#1512; &#1514;&#1490;&#1493;&#1489;&#1492; &#1494;&#1493; &#1499;&#1491;&#1497; &#1500;&#1513;&#1502;&#1493;&#1512; &#1506;&#1500; &#1513;&#1500;&#1493;&#1493;&#1514;&#1499;&#1501; (&#1500;&#1497;&#1495;&#1510;&#1493; &#1499;&#1491;&#1497; &#1500;&#1490;&#1500;&#1493;&#1514; &#1488;&#1514; &#1492;&#1514;&#1490;&#1493;&#1489;&#1492; &#1513;&#1492;&#1493;&#1505;&#1514;&#1512;&#1492;).</div></div>";
		c[i].setAttribute('zenreader-hidden-talkback', oldIHb64);
	}
};

Ynet.prototype._hideTalkbacks = function() {
	var self = publisherInstances["Ynet"];
	if (!self._allowed())
			return;

	// Hide all FB comments (TODO provide an option to enable them back)
	/*
	var fbComments = document.getElementById('articleComments');
	if (fbComments)
		fbComments.style.setProperty('display', 'none', 'important');
	*/
	
	var allTB = self._getTalkbacks();
		
	for (var i = 0; i < allTB.length; i++) {
		self._parseTalkback(allTB[i]);
	}
};



