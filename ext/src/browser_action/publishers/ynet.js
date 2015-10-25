var _publisher = "Ynet";

document.getElementById('image-search-text').addEventListener('keydown', function(e) {  
  if ( e.which == 13 ) {
     e.preventDefault();
     var term = document.getElementById("image-search-text").value;
     document.getElementById('status').innerHTML = 'Searching for ' + term;
      
     save_options();
  }
});
