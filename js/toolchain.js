const fs       = require( 'fs' );
const Settings = require( './settings.js' ).Settings;
const spawn    = require("child_process").spawn;
function Toolchain () {
  let self       = this;
  let path       = '';
  let toolsList  = [];
  let settings   = new Settings ();
  const pathFile = 'settings.json';
  const pathTemp = 'temp';
  this.run = async function ( name, source ) {
    return new Promise( async function ( resolve ) {
      let exist = false;
      for ( var key in settings.data ) {
        if ( name == key ) {
          exist = true;
          break;
        }
      }
      if ( exist == true ) {
        let options = settings.data[name];
        if ( options.enb == true ) {
          if ( ! name.endsWith( '.py' ) ) {
            name += '.py';
          }
          if ( toolsList.includes( name ) ) {
            let message = await runPython( ( path + name ), options, source )
            console.log( message )
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
  async function runPython ( name, options, source ) {
    return new Promise( async function ( resolve ) {
      workspace = await makeTempFolder();
      args      = [ name ];
      options.keys.forEach( function ( key ) {
        args.push( key.key );
        switch ( key.id ) {
          case 'source':
            args.push( source );
            break;
          case 'out':
            args.push( workspace );
            break;
          default:
            break;    
        }
      });
      const pythonProcess = spawn( options.type, args );
      pythonProcess.stdout.on( 'data', function ( data ) {
        resolve( data.toString() );
      });
    });
  }
  async function makeTempFolder () {
    return new Promise( function ( resolve ) {
      let dir = __dirname + '\\' + pathTemp + '\\';
      if ( fs.existsSync( dir ) == false ) {
        fs.mkdirSync( dir );
        resolve( dir );
      } else {
        resolve( dir );
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