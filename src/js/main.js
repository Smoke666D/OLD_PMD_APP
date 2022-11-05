var connectInit = require('./js/render.js').connectPDMinit;
const luaproc   = require('./js/lua-processing.js').luaproc;
const settings  = require( './js/settings.js' ).settings;
const { dialog }   = require( 'electron' ).remote;
``
/*----------------------------------------------------------------------------*/

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
function checkScript () {
	luaproc.check();
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
function GetFolderPath( element_id) {
	console.log("dfdf");
	let path = dialog.showOpenDialog( { 
		title:      'Выбрать путь',
		properties: ['openDirectory'] 
	  }).then( function ( result ) {
		if ( result.filePaths[0] != undefined ) {
		 var inputfield =  document.getElementById(element_id);
		 var temp_str = result.filePaths + '\\'
		 inputfield.value = temp_str;		 
		} else {
		  
		}
	  }).catch( function ( error ) {
		
	  });
	return;
}