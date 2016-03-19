var Ynet = function(tracker) {

	//
	// Constructor
	//

	// Call super
	Publisher.call(this, tracker);

	this.allowedDomains = ["ynet.co.il"];

	this.authorsList = ['רון בן ישי', 'רון  בן-ישי', 'יועז הנדל', 'איתי גל','דנה ספקטור'];

	this.authorsNormalizedXlatTable = {'רון בן ישי':'ron-ben-yishai',
									   'רון בן-ישי' : 'ron-ben-yishai',
									   'יועז הנדל' : 'yoaz-hendel',
									   'איתי גל' : 'itay-gal',
                                       'דנה ספקטור':'dana-spector'};

	this.authorSelectors = ['span.art_header_footer_author>span', 'span.art_header_footer_author>span>a', 'span.mta_gray_text', '.sub_title.sub_title_no_credit', '.authorHtmlCss'];

  this.articeImgsSelectors = ['div.ArticleImage>img',
															'img.boxes_left_big_divimg_img',
                              'img.boxes_right_video_preview_img',
                              'img.boxes_left_regular_divimg_img',
                              'img.boxes_right_regular_divimg_img',
                              'div.art_headlines_item>a>img',
                              'div.top-story-media>a.media_image_link_box>img[data-dy-img]',
                              'div.magazine_image>img',
                              'a.myNetItemImgLink>img',
                              'div.pphp_item_image>a>img',
                              'div.multiimagesnews_item_image>a>img',
                              'ul.mta_pic_items>li>a>img',
                              'div.hpstrip3spanFloatR>a>img',
                              'div.cell.cshort>a>img',
                              'div.citv_image>img',
                              'div.citv_image>font>img',
                              'div.ArticleImage>img',
                              'div.gspp_main>a.gspp_image>img',
                              'div.media.image>img'];

	// Create a uniform name list of authors for tracking
	var dpKeyList = Object.keys(this.authorsNormalizedXlatTable);
	for (var i = 0; i < dpKeyList.length; i++) {
		this.authorsTrackingUniformName[this.authorsNormalizedXlatTable[dpKeyList[i]]] = this.authorsNormalizedXlatTable[dpKeyList[i]];
	}

	for (var j = 0; j < this.authorsList.length; j++) {
		this.authorsRegEx[j] = XRegExp(this.authorsList[j]);
	}

    this.articleSelectors = ['#multiarticles-1 > div.content_wrap > ul.mta_pic_ites',
                             'div.hp_lite_player_item_wrapper>div.hp_lite_player_item_wrapper>div.hp_lite_player_item',
                             '#main > div.area.content.no_trajectory > div.block.B6 > div.block.B6 > div.block.B3 > div.block.B3 > div.element.B3.ghcite.noBottomPadding',
                             'div#main>div.area.content > div > div.block.B4.spacer',
                             'div > div.pphp_main > ul > li > div.pphp_li_items',
                             'div.top-story>div.top-story-main'];

	this.talkbackParentClass = 'art_tkb_talkback';

	this.talkbackTitleSelectors = ['.art_tkb_talkback_title'];

	this.talkbackTextSelectors = ['.art_tkb_talkback_content'];

	this.talkbackIdRegExp = XRegExp('[0-9]+');
};

Ynet.prototype = Object.create(Publisher.prototype);
Ynet.prototype.constructor = Ynet;

Ynet.prototype._climbeToArticle = function(self, element) {
	if (element.classList.contains('mta_gray_text') && element.parentElement && element.parentElement.tagName === 'LI') {
		return element.parentElement;
	}
    if (element.classList.contains('mta_title') && element.parentElement && element.parentElement.tagName === 'LI') {
		return element.parentElement;
	}
	else if (element.tagName === 'A' && element.parentElement && element.parentElement.tagName === 'SPAN') {
		return document.querySelector('.block.B4.spacer');
	}
	else if (element.tagName === 'DIV' && element.classList.contains('transpernt-div') && element.parentElement && element.parentElement.tagName === 'LI') {
		return element.parentElement;
	}

    var e = element;
    while (e && e !== document.body) {
        e = e.parentElement;

        for (var i = 0; i < self.articleSelectors.length; i++) {
            var aSel = self.articleSelectors[i];

            var selE = e.parentElement.querySelectorAll(aSel);

            for (var r = 0; r < selE.length; r++) {
                if (selE[r] && selE[r].isSameNode(e))
                    return e;
            }

        }
    }

	return null;
};

Ynet.prototype.uid = function() {
	return 'ynet';
};

Ynet.prototype.run = function(rerun, force) {
	if (!this._allowed())
		return;

    this.force = force;

	this._hideAuthors();

    this._hideSubjectTitle();

	if (!rerun) {
		window.setInterval(this._hideTalkbacks, 1000);
	}

    // this._unicornMode();

    this._synopsis();
};

Ynet.prototype._synopsis = function() {
    chrome.storage.sync.get('zen_options',
						  function(items) {

                            var self = publisherInstances["Ynet"];

                            if (!items || !items.zen_options["Ynet"]["labs"]["summarization"]) {
                                self._removeSynopsis(self);
                                return;
                            }

                            var existingSyn = document.getElementById('zen-reader-synopsis');
                            if (existingSyn) {
                                document.removeChild(existingSyn);
                            }

							// var articleFirstParag = document.querySelector('#main>div.area.content>div>div.block.B4.spacer>div.block.B4>div.block.B3>div.block.B3>div.element.B3.ghcite>div>div[class^="text"]>span');
							var articleFirstParag = document.querySelector('div.art_header_bottom, div.hr.solid, div#ahpp-1');

							if (!articleFirstParag) {
								console.log("Cannot insert synopsis, since cannot detect articleFirstParag!");
								return;
							}
							
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

                            // articleFirstParag.parentElement.insertBefore(pendingDiv, articleFirstParag);
							articleFirstParag.parentElement.insertBefore(pendingDiv, articleFirstParag.nextSibling);

                            // var synopsis = self._computeSynopsis(self, '#main>div.area.content>div>div.block.B4.spacer>div.block.B4>div.block.B3>div.block.B3>div.element.B3.ghcite>div>div[class^="text"]>span>p');
							var synopsis = self._computeSynopsis(self, 'div.art_body, div.element.B3.ghcite>div>div[class^="text"]>span>p');

                            var bgColor = 'rgba(240,240,240,0.35)';
                            var marginB = '75px';
                            var paddingB = '15px 15px 15px 15px';
                            if (null === synopsis) {
                                bgColor = 'rgba(200,200,200,0.65)';
                                marginB = '10px';
                                paddingB = '15px 15px 25px 15px';
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

Ynet.prototype._hideAuthors = function() {
	if (!this._allowed()) {
		this.tracker.sendEvent('NotAllowedPage', 'na', 1);
		return;
	}

	chrome.storage.sync.get('zen_options',
						function(items) {
							publisherInstances["Ynet"]._eraseHiddenAuthors(items.zen_options["Ynet"]["authors_map"]);
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
    chrome.storage.sync.get('zen_options',
						function(items) {
                            var self = publisherInstances["Ynet"];
                            if (items && items.zen_options["Ynet"]["comments"]) {
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
                            }
                            else {
                                self._revealTalkbacks();
                            }

                            self._updateBadge();
                        });

};

Ynet.prototype._hideSubjectTitle = function() {
    chrome.storage.sync.get('zen_options',
						function(items) {
                            var self = publisherInstances["Ynet"];

                            if (items && items.zen_options["Ynet"]["labs"]["by-subject"]) {
                                var subjects = document.querySelectorAll(['.subtitle',
                                                                          '.title',
                                                                          '.sub_title',
                                                                          '.sub-title',
                                                                          '.hpstrip_title',
                                                                          '.hpstrip_text',
                                                                          '.mta_title',
                                                                          '.art_header_sub_title',
                                                                          '.art_header_title',
                                                                          '.hp_lite_player_overlay_text',
                                                                          'li>div.transpernt-div',
                                                                          'span.mta_pic_text>a',
                                                                          'div.pphp_li_items > div.pphp_main_li_title > a.rpphp_main_title > span']);


                                self._hideSubjects(self, subjects);
                            }
                            else {
                                self._revealSubjects(self);
                            }

    });
}

Ynet.prototype._unicornMode = function() {
    chrome.storage.sync.get('zen_options',
						function(items) {
                            var self = publisherInstances["Ynet"];

														// Hook an image error handler to replace back image that did not load
														$("img").error(function () {
														  $(this).unbind("error").attr("src", $(this).attr('zen-reader-osrc'));
															$(this).attr('zen-reader-osrc','#');
														});

                            if (items && items.zen_options["Ynet"]["image-bank"]) {
                                self.EXP_search(self, items.zen_options["Ynet"]["image-bank"]);
                            }
                            else {
                                // Nada
                            }

    });
}

Ynet.prototype._imgSizes = function() {
		var self = publisherInstances["Ynet"];
    var imgs = document.querySelectorAll(self.articeImgsSelectors);

    var total = imgs.length;
    var ratios = {};
    for (var i = 0; i < imgs.length; i++) {
        if (imgs[i].height > 0) {
            var r = Math.round((imgs[i].width / imgs[i].height)*100);
            if (!(r in ratios))
                ratios[r] = 1;
            else
                ratios[r] += 1;
        }
    }

		var candidates = []
    for (var r = 0; r < Object.keys(ratios).length; r++) {
        var key = Object.keys(ratios)[r];
        var count = ratios[key];
        if ((count / total) >= 0.1) {
					candidates.push(key);
        }
    }

		candidates = candidates.sort(function(a, b){return a-b});
		for (var c = 0; c < candidates.length-1; c++) {
			if (candidates[c] / candidates[c+1] > 0.95)
				candidates[c] = 0;
		}

		var final = []
		for (var c = 0; c < candidates.length; c++) {
			if (candidates[c] > 0) {
				final.push(candidates[c]/100);
			}
		}

		console.log("Image size ratios: ", final);
		return final;
}

Ynet.prototype.EXP_cb = function(text, status, jqxhr) {
		var self = publisherInstances["Ynet"];
    var imgs = document.querySelectorAll('a[href*="imgurl"]');

    if (imgs.length > 0) {
        topArticleImgs = document.querySelectorAll(self.articeImgsSelectors);
        var im = Math.round(Math.random()*imgs.length);
				var wraparounds = 0;

        for (var i = 0; i < topArticleImgs.length && wraparounds <= 2; i++) {

						var validImage = imgs[im];
					 	while ((!validImage ||
										validImage.href.length === 0 ||
										!validImage.href.startsWith('http'))
										&& wraparounds <= 2) {
							im += 1;
							if (im >= imgs.length) {
									wraparounds += 1;
									im = 0;
							}

							validImage = imgs[im];
						}

						var imgURegEx = XRegExp('imgurl\=.*\&');
						var candidateURL = imgURegEx.exec(validImage.href);
						candidateURL = candidateURL[0].split('=')[1].split(/[&%\?]/g)[0]

						if (candidateURL &&
								candidateURL.length > 0 &&
								(candidateURL.endsWith('.jpg') || candidateURL.endsWith('.png') || candidateURL.endsWith('.gif'))) {

								var oSrc = topArticleImgs[i].src;
								topArticleImgs[i].onerror = "alert('error')";

								topArticleImgs[i].src = candidateURL;
								topArticleImgs[i].title = "Zen Reader replaced this image"

								topArticleImgs[i].setAttribute('zen-reader-osrc', oSrc);
						}

						im += 1;
						if (im >= imgs.length) {
								wraparounds += 1;
								im = 0;
						}
        }
    }

    document.body.removeChild(document.getElementById('zen-reader-__temp__result'));
}

Ynet.prototype.EXP_search = function(self, term) {
		// Compute the common size ratio w/h (sorted from smaller to larger)
		var sizeRatios = self._imgSizes();

    term = encodeURI(term);

    var r = document.createElement('DIV');
    r.id = 'zen-reader-__temp__result';
    r.style.display = 'none';
    r.style.width = 0;
    r.style.height = 0;
    document.body.appendChild(r);

		// Tall(t), Wide(w), Square(s), Panoramic(xw)
		var aspectRatio = 'w'
		if (sizeRatios[0] < 0.75)
			aspectRatio = 't';
		else if (sizeRatios[0] < 1.5)
			aspectRatio = 's';
		else if (sizeRatios[0] < 2.0)
			aspectRatio = 'w';
		else
			aspectRatio = 'xw'

		console.log('aspect ratio: ', aspectRatio);

    $("#zen-reader-__temp__result").load("https://www.google.co.il/search?q=" + term + "&tbm=isch&tbs=isz:lt,islt:qsvga,iar:" + aspectRatio,
                                         '',
                                         self.EXP_cb);
}
