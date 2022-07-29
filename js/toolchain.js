const fs = require( 'fs' );

function Toolchain () {
  let self = this;
  let path = '';
  let settings   = null;
  let toolsList  = [];
  const pathFile = 'settings.json';

  this.run = async function ( name ) {
    return new Promise( function ( resolve ) {
      if ( ! name.endsWith( '.py' ) ) {
        name += '.py';
      }
      if ( toolsList.includes( name ) ) {
        resolve( true );
      } else {
        resolve( false );
      }
    });
  } 

  function init () {
    fs.readFile( pathFile, 'utf-8', function ( error, data ) {
      if ( error == null ) {
        settings = JSON.parse( data );
        path     = settings.toolchainPath;
        fs.readdir( path, function ( error, list ) {
          if ( error == null ) {
            list.forEach( function ( item, i ) {
              if ( ( item.endsWith( '.py' ) ) && ( item.startsWith( 'lua' ) ) ) {
                toolsList.push( item );
              } 
            });
          }
        });
      }
    });
  }

  init();
  return;
}

module.exports.Toolchain = Toolchain;