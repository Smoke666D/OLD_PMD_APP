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
document.addEventListener( "DOMContentLoaded", function( event ) {
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
	document.getElementById( 'refreshData-button' ).disabled = true;
	document.getElementById( 'uploadData-button' ).disabled  = true;
	document.getElementById( 'versionSowtware' ).innerHTML   = softwareVersion;
	windowButtonsInit();
  loadContent( 'devicePage' );
	return;
});
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
