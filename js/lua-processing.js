const fs           = require( 'fs' );
const { pdm } = require('./pdm.js');
const { dialog }   = require( 'electron' ).remote;
const LuaCli       = require( './lua-cli.js' ).LuaCli;
const ProgressStep = require( './ProgressStep.js' ).ProgressStep;
const Toolchain    = require( './toolchain.js' ).Toolchain;
const settings     = require( './settings.js' ).settings;
const connect      = require( './render.js' ).connect;
const usb          = require( './usb.js' );
/*-----------------------------------------------------------------------------------*/
let luacli       = new LuaCli( 'lua-cli' );
let progressStep = new ProgressStep( 'progressStep-container' );
let toolchain    = new Toolchain();
/*-----------------------------------------------------------------------------------*/
let luaproc = new LuaProcess( luacli, progressStep );
/*-----------------------------------------------------------------------------------*/
let luaPath = '';
let lua = '';
/*-----------------------------------------------------------------------------------*/
async function luaopen ( data ) {
  return new Promise( function ( resolve ) {
    let res  = false;
    luacli.newLine( 'Openning ' );
    let path = dialog.showOpenDialog( { 
      title:      'Открыть lua',
      filters:    [{ name: 'lua', extensions: ['lua']}],
      properties: ['openFile'] 
    }).then( function ( result ) {
      if ( result.filePaths[0] != undefined ) {
        luaPath = result.filePaths[0];
        luacli.add( ' ' + luaPath + '...' );
        fs.readFile( luaPath, 'utf8', function ( error, data ) {
          if ( error ) {
            resolve( ['error', ''] );    
          }
          lua = data;
          luacli.add( 'Done!' );
          resolve( ['ok', luaPath] );
        });
      } else {
        luacli.add( '...Fail!' );
        resolve( ['error', ''] );
      }
    }).catch( function ( error ) {
      luacli.add( '...Fail! ' + error );
      resolve( ['error', ''] );
    });
  });
}
async function runTool ( name, path ) {
  return new Promise( async function ( resolve ) {
    let res = 'ok';
    let err = '';
    let mes = '';
    let out = '';
    luacli.newLine( 'Run ' + name + '...' );
    [res, err, mes] = await toolchain.run( name, path );
    if ( err == 'skip' ) {
      luacli.add( err, 'text-warning' );
    } else if ( err != null ) {
      luacli.add( 'fail', 'text-danger' );
      luacli.newLine( 'Error with the ' + name + ': ' + err );
    } else {
      if ( name == 'luacheck' ) {
        [res, out] = await parsingCheckerMessage( mes );
      } else {
        [res, out] = await parsingPythonMessage( mes );
      }
    }
    resolve( [res, out] );
  });
}
async function parsingCheckerMessage ( str ) {
  return new Promise( async function ( resolve ) {
    let color    = null;
    let done     = 'ok';
    let text     = 'DONE';
    let outPath  = '';
    let total    = str.substring( str.indexOf( 'Total:' ) );
    let warnings = parseInt( total.substring( 7, total.indexOf( 'warnings' ) ) );
    let errors   = parseInt( total.substring( ( total.indexOf( '/' ) + 2 ), total.indexOf( 'errors' ) ) );
    luacli.newLine( str );
    if ( errors > 0 ) {
      color = 'text-danger';
      done  = false;
      text  = 'ERROR';
      done  = 'error';
    } else if ( warnings > 0 ) {
      color = 'text-warning';
      text  = 'WARNING';
      done  = 'warning';
    }
    luacli.newLine( text, color );
    resolve( [done, outPath] );
  });
}
async function parsingPythonMessage ( message ) {
  return new Promise( async function ( resolve ) {
    if ( message != null ) {
      let done    = 'ok';
      let outPath = '';
      let lines   = message.split('\n');
      for ( var i=0; i<lines.length; i++ ) {
        if ( lines[i].length > 0 ) {
          let color = null;
          if ( lines[i].includes( '[ERROR]' ) ) {
            color = 'text-danger';
            done  = 'error';
          } else if ( lines[i].includes( '[WARNING]' ) ) {
            color = 'text-warning';
          }
          let text = lines[i].substring( lines[i].indexOf( '] ' ) + 2 );
          if ( text.includes( '\033[' ) ) {
            text = text.substring( text.indexOf( 'm' ) + 1 );
            if ( text.includes( '\033[' ) ) {
              text = text.substring( 0, text.indexOf( '\033[' ) );
            }
          }

          if ( text.startsWith( 'DONE' ) ) {
            outPath = text.substring( 6 );
          }

          luacli.newLine( text, color );
        }
      }
      resolve( [done, outPath] );
    } else {  
      resolve( ['error', outPath] );
    }
  });
}
async function lualink ( data ) {
  return new Promise( async function ( resolve ) {
    resolve( await runTool( 'lualink', data ) );
  });
}
async function luacheck ( data ) {
  return new Promise( async function ( resolve ) {
    resolve( await runTool( 'luacheck', data ) );
  });
}
async function luamin ( data ) {
  return new Promise( async function ( resolve ) {
    resolve( await runTool( 'luamin', data ) );
  });
}
async function luamake ( data ) {
  return new Promise( async function ( resolve ) {
    resolve( await runTool( 'luamake', data ) );
  });
}
async function pdmconnect ( data ) {
  return new Promise( async function ( resolve ) {
    luacli.newLine( 'Try to connect to the PDM via USB...')
    let state = await connect( false );
    let res   = 'error';
    if ( state == false ) {
      luacli.add( 'Fail!' );
    } else {
      luacli.add( state );
      res = 'ok';
    }
    resolve( [res, ''] );
  });
}
function awaitUSB ( callback ) {
  setTimeout( async function () {
    let state = usb.controller.getStatus();
    if ( ( state == usb.usbStat.wait ) || ( state == usb.usbStat.dash ) ) {
      callback( true );
    } else {
      if ( usb.controller.isConnected() == true ) {
        awaitUSB( callback );
      } else {
        callback( false );
      }
    }
  }, 10 );
  return;
}
async function pdmload ( data ) {
  return new Promise( async function ( resolve ) {
    luacli.newLine( 'Loading the lua script to the PDM...')
    let state = usb.controller.getStatus();
    fs.readFile( data, 'utf8', async function ( error, data ) {
      if ( error ) {
        resolve( ['error', ''] );    
      }
      pdm.lua = data;
      if ( ( state == usb.usbStat.wait ) || ( state == usb.usbStat.dash ) ) {
        usb.controller.send( null );
        awaitUSB( function ( result ) {
          if ( result == true ) {
            luacli.add( 'Done!' );
            usb.controller.resetLoopBusy();
            resolve( ['ok', ''] );
          } else {
            luacli.add( 'Fail!' );
            usb.controller.resetLoopBusy();
            resolve( ['error', ''] );
          } 
        });
        
      }
    });
  });
}
/*-----------------------------------------------------------------------------------*/
const luaStages = [
  { "name" : "luaopen",
    "callback" : luaopen },
  { "name" : "lualink",
    "callback" : lualink },
  { "name" : "luacheck",
    "callback" : luacheck },
  { "name" : "luamin",
    "callback" : luamin },
  { "name" : "luamake",
    "callback" : luamake },
  { "name" : "pdmconnect",
    "callback" : pdmconnect },
  { "name" : "pdmload",
    "callback" : pdmload }
];

function skip () {
  return new Promise( async function ( resolve ) {
    resolve( true );
  });
}

function LuaProcess ( icli, iprogress ) {
  let self     = this;
  let cli      = icli;
  let progress = iprogress;
  let prevOut  = '';

  this.start = async function () {
    let res = 'ok';
    let out = '';
    progress.clean();
    toolchain.init();
    for ( var i=0; i<luaStages.length; i++ ) {
      [res, out] = await procStage( luaStages[i].callback, ( i == ( luaStages.length - 1 ) ), prevOut );
      if ( out != '' ) {
        prevOut = out;
      }
      if ( ( res !='ok' ) && ( res != 'warning' ) ) {
        luacli.newLine( 'Finish with error', 'text-danger' );
        break;
      }
    }
    return;
  }
  async function procStage ( callback, isEnd, input ) {
    return new Promise( async function ( resolve ) {
      let result = false;
      let out    = '';
      await progress.setLoading();
      [result, out] = await callback( input );
      if ( result == 'ok' ) {
        await progress.setSeccess();
        if ( isEnd == false ) {
          await progress.next();
        }
        resolve( [result, out] );
      } else if ( result == 'warning') {
        await progress.setWarning();
        if ( isEnd == false ) {
          await progress.next();
        }
        resolve( [result, out] );
      } else {
        await progress.setError();
        resolve( [result, out] );
      }
    });
  }
  return;
}
/*-----------------------------------------------------------------------------------*/
module.exports.luaproc = luaproc;