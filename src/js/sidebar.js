function toogleNav () {
	var sb   = document.getElementById( 'sidebar' );
	if ( sb.classList.contains( 'active' ) ) {
		sb.classList.remove( 'active' );
	} else {
		sb.classList.add( 'active' );
	}
	return;
}

function hideContent () {
	var contentPages = document.getElementsByClassName( 'content-data' );
	var navItems     = document.getElementsByClassName( 'navItem' );
	for ( var i=0; i<navItems.length; i++ ) {
		navItems[i].classList.remove( 'checked' );
	}
	for ( var i=0; i<contentPages.length; i++ ) {
		contentPages[i].classList.add( 'hidden' );
	}
	return;
}

function loadContent ( id ) {
	hideContent();
	document.getElementById( id ).classList.remove( 'hidden' );
	document.getElementById( 'nav-' + id ).classList.add( 'checked' );
	var sb = document.getElementById( 'sidebar' );
	if ( window.matchMedia( '(max-width: 991.98px)' ).matches ) {
		sb.classList.remove( 'active' );
		sidebarDone = 0;
	}
	document.getElementById( 'content' ).scrollTop = 0;
	return;
}

var sidebarDone = 0;
document.getElementById( 'content' ).addEventListener( 'click', () => {
	var sb = document.getElementById( 'sidebar' );
	if ( !sb.classList.contains( 'active' ) ) {
		sidebarDone = 0;
	}
	if ( ( window.matchMedia( '(max-width: 991.98px)' ).matches ) && ( sb.classList.contains( 'active' ) ) && ( sidebarDone == 1 ) )  {
 		sb.classList.remove( 'active' );
		sidebarDone = 0;
}});

document.getElementById( 'sidebar' ).addEventListener( 'transitionend', () => {
	var sb = document.getElementById( 'sidebar' );
	if ( ( window.matchMedia( '(max-width: 991.98px)' ).matches ) && ( sb.classList.contains( 'active' ) ) ) {
		sidebarDone = 1;
}});