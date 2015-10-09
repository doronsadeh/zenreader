var numBlockedAuthors = 0;

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
        
                                // Save the current state of the comments hiding checkbox
                                zenOptions[_publisher]["comments"] = document.getElementById('comments-enable').checked;

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
	var elements = document.getElementsByClassName("author-input");
    for(var i=0; i < elements.length; i++){
        elements[i].addEventListener('click', save_options, false);
    }
    
    elements = document.getElementsByClassName("comments-input");
    for(var j=0; j < elements.length; j++){
        elements[j].addEventListener('click', save_options, false);
    }
}

function restore_options() {
	numBlockedAuthors = 0
	chrome.storage.sync.get("zen_options",
							function(items) {
                                if (!items || !items.zen_options) {
                                    // Global options were never saved, track this
                                    console.error('Zen Reader options do not exist on restore, consider reinstalling/reloading extension.');
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

                                    document.getElementById('comments-enable').checked = items.zen_options[_publisher]["comments"];
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
    
	var comments = document.querySelectorAll('input.comments-input');
	for (var j = 0; j < comments.length; j++) {
		comments[j].checked = state;
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
	
	document.getElementById('sel-des-all').addEventListener('click', function(e) {toggle_all(e);} );
	document.getElementById('request-new-author').addEventListener('click', function(e) {request_new_author(e);} );
}

