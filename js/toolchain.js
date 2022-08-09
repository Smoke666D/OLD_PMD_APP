const fs       = require( 'fs' );
const settings = require( './settings.js' ).settings;
const spawn    = require("child_process").spawn;
function Toolchain () {
  let self       = this;
  let path       = '';
  let toolsList  = [];
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
          if ( name.endsWith( '.py' ) == false ) {
            name += '.py';
          }
          if ( toolsList.includes( name ) ) {
            let message = await runPython( ( path + name ), options, source )
            resolve( [true, null, message ] );
          } else {
            resolve( [false, "Script doesn't exist in the filesystem", null] );
          }
        } else {
          resolve( [true, "skip", null] );
        }
      } else {
        resolve( [false, "Script doesn't exist in the settings", null] );
      }
    });
  }
  this.clean = function () {
    return;
  }
  this.init = function () {
    return new Promise( async function ( resolve ) {
      await settings.init();
      path = settings.data.toolchainPath;
      fs.readdir( path, function ( error, list ) {
        if ( error == null ) {
          list.forEach( function ( item ) {
            if ( ( item.endsWith( '.py' ) ) && ( item.startsWith( 'lua' ) ) ) {
              toolsList.push( item );
            }
          });
          resolve( true );
        } else {
          resolve( false );
        }
      });
    });
  }
  async function runPython ( name, options, source ) {
    return new Promise( async function ( resolve ) {
      let str  = '';
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
          case 'linkfile':
            args.push( source.substring( 0, source.lastIndexOf( '\\' ) ) + '\\luald.json' );  
          case 'libpath':
            args.push( settings.data.libPath );  
          default:
            break;    
        }
      });
      const pythonProcess = spawn( options.type, args );
      pythonProcess.stdout.on( 'data', function ( data ) {
        str = data.toString();
      });
      pythonProcess.on( 'close', function ( code ) {
        resolve( str );
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
  self.init();
  return;
}
module.exports.Toolchain = Toolchain;