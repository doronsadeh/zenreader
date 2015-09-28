
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

