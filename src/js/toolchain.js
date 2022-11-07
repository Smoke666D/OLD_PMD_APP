const fs       = require( 'fs' );
const pathNJS   = require( 'path' );
const settings = require( './settings.js' ).settings;
const spawn    = require("child_process").spawn;
function Toolchain () {
  let self       = this;
  let path       = '';
  let toolsList  = [];
  let except     = [];
  const pathTemp = 'temp';
  this.run = async ( name, source ) => {
    return new Promise( async ( resolve ) => {
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
          if ( options.type == 'python' ) {
            if ( name.endsWith( '.py' ) == false ) {
              name += '.py';
            }
          } else if ( options.type == 'exe' ) {
            if ( name.endsWith( '.exe' ) == false ) {
              name += '.exe';
            }
          }
          if ( toolsList.includes( name ) ) {
            if ( options.type == 'python' ) {
              let message = await runPython( pathNJS.join( path, name ), options, source );
              if ( message != "Fail" ) {
                resolve( ['ok', null, message ] );
              } else {
                resolve( ['error', "Python script error", null ] );
              }
            } else if ( options.type == 'exe' ) {
              let message = await runExe( pathNJS.join( path, name ), options, source );
              if ( ( message != "Fail" ) || ( err > 0 ) ) {
                resolve( ['ok', null, message ] );
              } else {
                resolve( ['error', "Exe program error", null ] );
              }
            }
            
          } else {
            resolve( ['error', "Script doesn't exist in the filesystem", null] );
          }
        } else {
          resolve( ['warning', "skip", null] );
        }
      } else {
        resolve( ['error', "Script doesn't exist in the settings", null] );
      }
    });
  }
  this.clean = () => {
    return;
  }
  this.init = () => {
    return new Promise( async ( resolve ) => {
      await settings.init();
      path = pathNJS.normalize( settings.data.toolchainPath );
      fs.readdir( path, ( error, list ) => { 
        if ( error == null ) {
          list.forEach( ( item ) => {
            if ( ( item.startsWith( 'lua' ) ) && ( item.endsWith( '.py'  ) || item.endsWith( '.exe' ) ) ) {
              toolsList.push( item );
            }
          });
          fs.readFile( pathNJS.join( path, 'exceptionsNames.json' ), 'utf-8', async ( error, data ) => { 
            if ( error ) {
              resolve( false );
            } else {
              let list = JSON.parse( data );
              except = list.exceptions;
              resolve( true );
            }
          });
        } else {
          let alert = new Alert( 'alert-danger', triIco, 'Ошибка чтения инструментов' );
          resolve( false );
        }
      });
    });
  }
  async function runExe ( name, options, source ) {
    return new Promise( async ( resolve ) => {
      let str   = '';
      workspace = await makeTempFolder();
      args      = [];
      options.keys.forEach( ( key ) => {
        if ( ( 'enb' in key ) == true ) {
          if ( ( key.enb == true ) && ( key.key.length > 0 ) ) {
            args.push( key.key );
          }
        } else {
          if ( key.key.length > 0 ) {
            args.push( key.key );
          }
        }
        switch ( key.id ) {
          case 'lib':
            let out = settings.data.libPath;
            if ( out.endsWith( '\\' ) ) {
              out = out.slice( 0, -1 );
            }
            args.push( out );
            break;
          case 'source':
            args.push( source );
            break;
          case 'globals':
            except.forEach( ( item ) => {
              args.push( item );
            }) 
            break; 
          case 'out':
            args.push( workspace + source.substring( ( source.lastIndexOf( '\\' ) + 1 ), source.lastIndexOf( '.' ) ) + '.luac.lua' );  
          default:
            break;    
        } 
      });
      const exeProcess = spawn( name, args );
      exeProcess.stdout.on( 'data', ( data ) => {
        str = data.toString();
      });
      exeProcess.on( 'close', ( code ) => {
        if ( ( str.length == 0 ) && ( code == 0 ) ) {
          resolve( 'DONE: ' + workspace + source.substring( ( source.lastIndexOf( '\\' ) + 1 ), source.lastIndexOf( '.' ) ) + '.luac.lua')
        } else {
          resolve( str );
        }
      });
    });
  }
  async function runPython ( name, options, source ) {
    return new Promise( async ( resolve ) => {
      let str  = '';
      workspace = await makeTempFolder();
      args      = [ name ];
      options.keys.forEach( ( key ) => {
        if ( ( 'enb' in key ) == true ) {
          if ( key.enb == true ) {
            args.push( key.key );
          }
        } else {
          args.push( key.key );
        }
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

      let callStr = options.type + ' ';
      args.forEach( function ( arg ) {
        callStr += arg + ' ';
      });

      pythonProcess.stdout.on( 'data', ( data ) => {
        str = data.toString();
      });
      pythonProcess.on( 'close', ( code ) => {
        if ( code == 0 ){
          resolve( str );
        } else {
          resolve( 'Fail' );
        }
      });
    });
  }
  async function makeTempFolder () {
    return new Promise( ( resolve ) => {
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