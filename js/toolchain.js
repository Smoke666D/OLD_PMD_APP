const fs       = require( 'fs' );
const Settings = require( './settings.js' ).Settings;
const common   = require( './common.js' );
function Toolchain () {
  let self       = this;
  let path       = '';
  let toolsList  = [];
  let settings   = new Settings ();
  const pathFile = 'settings.json';
  this.run = async function ( name ) {
    return new Promise( function ( resolve ) {
      let exist = false;
      for ( var key in settings.data ) {
        if ( name == key ) {
          exist = true;
          break;
        }
      }
      if ( exist == true ) {
        if ( settings.data[name].enb == true ) {
          if ( ! name.endsWith( '.py' ) ) {
            name += '.py';
          }
          if ( toolsList.includes( name ) ) {
            resolve( true );
          } else {
            resolve( false );
          }
        } else {
          resolve( true );
        }
      } else {
        resolve( false );
      }
    });
  }
  async function init () {
    await settings.init();
    path = settings.data.toolchainPath;
    fs.readdir( path, function ( error, list ) {
      if ( error == null ) {
        list.forEach( function ( item ) {
          if ( ( item.endsWith( '.py' ) ) && ( item.startsWith( 'lua' ) ) ) {
            toolsList.push( item );
          }
        });
      }
    });
    return;
  }
  init();
  return;
}
module.exports.Toolchain = Toolchain;