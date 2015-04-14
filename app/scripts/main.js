(function() {

	var bodyEl = document.body,
		content = document.querySelector( '.content-wrap' ),
		openbtn = document.getElementById( 'open-button' ),
		searchbtn = document.getElementById( 'open-search-button' ),
		closebtn = document.getElementById( 'close-button' ),
		searchclosebtn = document.getElementById( 'close-search-button' ),
		isOpen = false,
		isSearchOpen = false;
        
        

	function init() {
		initEvents();
	}

	function initEvents() {
		openbtn.addEventListener( 'click', toggleMenu );
        searchbtn.addEventListener('click', toggleSearch);
		if( closebtn ) {
			closebtn.addEventListener( 'click', toggleMenu );
		}
        if( searchclosebtn ) {
			searchclosebtn.addEventListener( 'click', toggleSearch );
		}

		// close the menu element if the target it´s not the menu element or one of its descendants..
		content.addEventListener( 'click', function(ev) {
			var target = ev.target;
			if( isOpen && target !== openbtn ) {
				toggleMenu();
			}
            if( isSearchOpen && target !== searchbtn ) {
				toggleSearch();
			}
		} );
	}

	function toggleMenu() {
		if( isOpen ) {
			classie.remove( bodyEl, 'show-menu' );
		}
		else {
			classie.add( bodyEl, 'show-menu' );
            classie.remove(bodyEl, 'show-search');
		}
		isOpen = !isOpen;
	}

    
	function toggleSearch() {
		if( isSearchOpen ) {
			classie.remove( bodyEl, 'show-search' );
		}
		else {
			classie.add( bodyEl, 'show-search' );            
            classie.remove(bodyEl, 'show-menu');
		}
		isSearchOpen = !isSearchOpen;
	}

	init();

})();
document.addEventListener("DOMContentLoaded", function(event) { 
    
    var transfix = document.querySelector('.css-transitions-only-after-page-load'); 
   
    setTimeout(function () { classie.remove(transfix, "css-transitions-only-after-page-load"); }, 10);

});
