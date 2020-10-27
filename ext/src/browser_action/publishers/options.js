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

                                // Save the search term, and derive imgs and store them
                                // zenOptions[_publisher]["image-bank"] = document.getElementById('image-search-text').value;
    
                                // Save the current state of the labs features enable checkbox
                                zenOptions[_publisher]["labs"] = { 'summarization': document.getElementById('labs-enable-synopsis').checked};

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
    elements = document.getElementsByClassName("labs-input");
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
                                    try {
                                        document.getElementById('labs-enable-synopsis').checked = items.zen_options[_publisher]["labs"]["summarization"];
                                    } catch (e) {
                                        // Silent
                                    }
                                }
							});
}

function toggle_all(e) {
	var state = true;
	if (event.shiftKey)
		state = false;
	
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
	
	var selDesAll = document.getElementById('sel-des-all');
    if (selDesAll)
        selDesAll.addEventListener('click', function(e) {toggle_all(e);} );
	
    var sendReq = document.getElementById('send-request');
    if (sendReq)
        sendReq.addEventListener('click', function(e) {request_new_author(e);} );

    var relNotes = document.getElementById('zen_version');
    if (relNotes)
        relNotes.addEventListener('click', function(e) { window.open('./relnotes.html'); } );
}

