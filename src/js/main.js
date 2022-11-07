var connectInit = require('./js/render.js').connectPDMinit;
const luaproc   = require('./js/lua-processing.js').luaproc;
const settings  = require( './js/settings.js' ).settings;
const { dialog }   = require( 'electron' ).remote;
``
/*----------------------------------------------------------------------------*/

/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
window.addEventListener ( 'load', () => {
	window.scrollTo( 0, 0 );
	return;
});
document.addEventListener ( 'touchmove', ( e ) => {
	e.preventDefault();
	return;
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
document.addEventListener( 'DOMContentLoaded', async ( event ) => {
	document.getElementById( 'versionSowtware' ).innerHTML   = softwareVersion;
	windowButtonsInit();
	connectInit();
  loadContent( 'luaPage' );
	return;
});
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
function GetFolderPath( element_id ) {
	let path = dialog.showOpenDialog( { 
		title:      'Выбрать путь',
		properties: ['openDirectory'] 
	  }).then( function ( result ) {
		if ( result.filePaths[0] != undefined ) {
		 var inputfield = document.getElementById( element_id );
		 var temp_str = result.filePaths + '\\';
		 inputfield.value = temp_str;		 
		}
	  }).catch( function ( error ) {
		
	  });
	return;
}