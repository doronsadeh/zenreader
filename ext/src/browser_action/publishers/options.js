var _haaretzAuthorsList = ["gideon-levi",
                           "merav-arlozorov",
                           "benny-tzipper",
                           "ofri-ilani",
                           "revital-madar",
                           "uri-katz",
                           "anshil-pepper",
                           "eyal-sagie-bizaui",
                           "hani-zubida",
                           "tahel-farosh",
                           "nehamia-shtresler",
                           "carolina-landsman",
                           "tzafi-saar",
                           "noa-ast",
                           "merav-michaeli"];

var _theMarkerAuthorsList = ["gideon-levi",
                            "merav-arlozorov",
                            "benny-tzipper",
                            "ofri-ilani",
                            "uri-katz",
                            "eyal-sagie-bizaui",
                            "hani-zubida",
                            "nehamia-shtresler",
                            "carolina-landsman",
                            "noa-ast"];

var _ynetAuthorsList = ["ron-ben-yishai",
                        "yoaz-hendel",
                        "itay-gal"];

var zenOptions = {
    "Haaretz" :{
        "authors" : _haaretzAuthorsList,
        "authors_map" : {},
        "comments": "enable"
    },
    "TheMarker" : {
        "authors" : _theMarkerAuthorsList,
        "authors_map" : {},
        "comments": "enable"
    },
    "Ynet" : {
        "authors" : _ynetAuthorsList,
        "authors_map" : {},
        "comments": "enable"
    }
};

var numBlockedAuthors = 0;

function set_zen_options_to_default() {
    var publishers = Object.keys(zenOptions);
    for (var i = 0; i < publishers.length; i++) {
        var pName = publishers[i];
        for (var j = 0; j < zenOptions[pName]["authors"].length; j++) {
            zenOptions[pName]["authors_map"][zenOptions[pName]["authors"][j]] = true;
        }
    }
    
    zenOptions[_publisher]["comments"] = true;
    
    chrome.storage.sync.set({
        "zen_options" : zenOptions
    }, function() {
        var status = document.getElementById('status');
        status.innerHTML = 'Status: boot OK';
    });

    var trigger = Math.random();
    chrome.storage.sync.set({'refresh': trigger});
}

function save_options() {
    'use strict';
	
    // Read all options into the *local* copy of zenOptions, so when we write-back
    // after we've modified our publisher, the others don't get nuked.
    chrome.storage.sync.get("zen_options",
							function(items) {
								// Get an up to date local copy of the global settings
                                zenOptions = items.zen_options;
                                
                                // Update it with the current publisher settings
                                var authors = document.querySelectorAll('input.author-input'), authorsMap = {};
                                numBlockedAuthors = 0;
                                for (var i = 0; i < authors.length; i++) {
                                    if (authors[i].checked)
                                        numBlockedAuthors += 1;

                                    authorsMap[new String(authors[i].id)] = authors[i].checked;
                                }

                                // Set the up to date authors map
                                zenOptions[_publisher]["authors_map"] = authorsMap;

                                // TODO change the commenat enable/diable state, and store it

                                chrome.storage.sync.set({
                                    "zen_options" : zenOptions
                                }, function() {
                                    // Update status to let user know options were saved.
                                    var status = document.getElementById('status');
                                    status.innerHTML = 'Status: Changes applied';
                                    setTimeout(function() {
                                        status.textContent = 'Status: ' + numBlockedAuthors + ' authors are blocked';
                                    }, 100);
                                });

                                var trigger = Math.random();
                                chrome.storage.sync.set({'refresh': trigger});
							});
}

function listenOnAllCheckboxes() {
	var classname = document.getElementsByClassName("author-input");
    for(var i=0;i<classname.length;i++){
        classname[i].addEventListener('click', save_options, false);
    }
}

function restore_options() {
	numBlockedAuthors = 0
	chrome.storage.sync.get("zen_options",
							function(items) {
                                if (!items || !items.zen_options) {
                                    // Global options were never saved, set them to default 
                                    set_zen_options_to_default();
                                }
                                else {
                                    var authorsMap = items.zen_options[_publisher]["authors_map"];
                                    var _publisherAuthorsList = zenOptions[_publisher]["authors"];
                                    for (var i = 0; i < _publisherAuthorsList.length; i++) {
                                        var author = _publisherAuthorsList[i];
                                        var checked = authorsMap[author];
                                        document.getElementById(author).checked = checked;
                                        if (checked)
                                            numBlockedAuthors += 1;
                                    }

                                    // TODO set/unset the comments tick with item.options["comments"]
                                }
							});
}

function toggle_all(e) {
	var state = true;
	if (event.shiftKey)
		state = false;
	
	var authors = document.querySelectorAll('input.author-input');
	for (var i = 0; i < authors.length; i++) {
		authors[i].checked = state;
	}
	
	save_options();
}

function request_new_author(e) {
	var trigger = Math.random();
	chrome.storage.sync.set({'req_new_author': trigger});
}

function onDOMLoaded() {
	// Print the version number
	var zVer = chrome.runtime.getManifest().version;
	document.getElementById('zen_version').innerHTML = 'v' + zVer;
	
	// Now restore all options from local storage
	restore_options();
}

//
// main
//
if (window === window.top) {
	document.addEventListener('DOMContentLoaded', onDOMLoaded);
	
	listenOnAllCheckboxes();
	
	document.getElementById('sel_des_all').addEventListener('click', function(e) {toggle_all(e);} );
	document.getElementById('request-new-author').addEventListener('click', function(e) {request_new_author(e);} );
}

