
function parseTalkback(talkback) {
	
	// TODO do we need to diff between hidden and flipped?
	if (talkback.element.hasAttribute('zenreader-hidden-talkback')) {
		return;
	}
	
	var titleWords = talkback.title.split(" ");
	var textWords = talkback.text.split("");
	
	var kill = false;
	
	for (var i = 0; i < titleWords.length; i++) {
		if (titleWords[i].indexOf("!") !== -1) {
			console.log('! detected title: ', titleWords);
			kill = true;
		}
	}

	for (var i = 0; i < textWords.length; i++) {
		if (textWords[i].indexOf("!") !== -1) {
			console.log('! detected text: ', titleWords);
			kill = true;
		}
	}
	
	if (kill) {
		
		var p = talkback.element.parentNode;
		var zen = document.createElement('IMG');
		p.appendChild(zen);
				
		talkback.element.style.setProperty('display', 'none', 'important');
		talkback.element.setAttribute('zenreader-hidden-talkback', 'hide');

	}
	
}

function getAllTalkbacks(parentClass, titleSelector, textSelector) {
	// Get all titles
	var allTBTitles = document.querySelectorAll(titleSelector);
	
	// Ready a list of all talkbacks (objects)
	var talkbacks = [];
	
	for (var i = 0; i < allTBTitles.length; i++) {
		// Get texts
		var p = allTBTitles[i].parentNode;
		if (p && p.classList.contains(parentClass)) {
			var textNode = p.querySelector(textSelector);
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
}


