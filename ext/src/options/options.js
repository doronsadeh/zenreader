var numBlockedAuthors = 0;

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

function save_options() {
	var authors = document.querySelectorAll('input.author-input');
	var authorsMap = {};
	numBlockedAuthors = 0
	for (var i = 0; i < authors.length; i++) {
		if (authors[i].checked)
			numBlockedAuthors += 1;
		
		authorsMap[new String(authors[i].id)] = authors[i].checked;
	}
  
	chrome.storage.sync.set({
		'authors': authorsMap,
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
}

function listenOnAllCheckboxes() {
	var classname = document.getElementsByClassName("author-input");
    for(var i=0;i<classname.length;i++){
        classname[i].addEventListener('click', save_options, false);
    }
}

var authorsList = ["gideon-levi", 
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
				   "tzafi-saar"];
				   
function restore_options() {
	numBlockedAuthors = 0
	chrome.storage.sync.get('authors',
							function(items) {
								var authorsMap = items.authors;
								for (var i = 0; i < authorsList.length; i++) {
									var author = authorsList[i];
									var checked = authorsMap[author];
									document.getElementById(author).checked = checked;
									if (checked)
										numBlockedAuthors += 1;
								}
							});
}


if (window === window.top) {
	document.addEventListener('DOMContentLoaded', restore_options);
	
	listenOnAllCheckboxes();
	
	document.getElementById('sel_des_all').addEventListener('click', function(e) {toggle_all(e);} );
	document.getElementById('request-new-author').addEventListener('click', function(e) {request_new_author(e);} );
}

