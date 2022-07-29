const fs       = require( 'fs' );
const Settings = require( './settings.js' ).Settings;
const spawn    = require("child_process").spawn;
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
          if ( toolsList.includes( path + name ) ) {
            await runPython( name )
            resolve( null );
          } else {
            resolve( "Script doesn't exist in the filesystem" );
          }
        } else {
          resolve( "skip" );
        }
      } else {
        resolve( "Script doesn't exist in the settings" );
      }
    });
  }
  this.clean = function () {
    return;
  }
  async function runPython ( name ) {
    return new Promise( function ( resolve ) {
      workspace = makeTempFolder();
      console.log( name )
      //const pythonProcess = spawn( 'python', ["path/to/script.py", arg1, arg2] );
    });
  }
  async function makeTempFolder () {
    return null;
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