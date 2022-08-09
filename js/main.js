var connectInit = require('./js/render.js').connectPDMinit;
const luaproc   = require('./js/lua-processing.js').luaproc;
const settings  = require( './js/settings.js' ).settings;
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
window.addEventListener ( 'load', function() {
	window.scrollTo( 0, 0 );
});
document.addEventListener ( 'touchmove', function( e ) {
	e.preventDefault()
});
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
function processingScript () {
	luaproc.start();
	return;
}
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
document.addEventListener( "DOMContentLoaded", async function( event ) {
  /*
	$( function () {
		$( '[data-toggle="tooltip"]' ).tooltip( {
		  delay:     { 'show': 500, 'hide': 0 },
			trigger:   'hover',
			placement: 'auto',
			animation: true,
		})
	})
	*/
	document.getElementById( 'versionSowtware' ).innerHTML   = softwareVersion;
	windowButtonsInit();
	connectInit();
  loadContent( 'luaPage' );
	return;
});
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
