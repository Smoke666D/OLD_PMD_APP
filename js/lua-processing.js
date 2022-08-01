const fs           = require( 'fs' );
const { dialog }   = require( 'electron' ).remote;
const LuaCli       = require( './lua-cli.js' ).LuaCli;
const ProgressStep = require( './ProgressStep.js' ).ProgressStep;
const Toolchain    = require( './toolchain.js' ).Toolchain;
const settings     = require( './settings.js' ).settings;
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
    let path = dialog.showOpenDialog( { 
      title:      'Открыть lua',
      filters:    [{ name: 'lua', extensions: ['lua']}],
      properties: ['openFile'] 
    }).then( function ( result ) {
      if ( result.filePaths[0] != undefined ) {
        luaPath = result.filePaths[0];
        luacli.newLine( 'Openning ' + luaPath + '...' );
        fs.readFile( luaPath, 'utf8', function ( error, data ) {
          if ( error ) {
            resolve( [false, ''] );    
          }
          lua = data;
          luacli.newLine( 'Done!' );
          resolve( [true, luaPath] );
        });
      } else {
        resolve( [false, ''] );
      }
    }).catch( function ( error ) {
      resolve( [false, ''] );
    });
  });
}

async function runTool ( name, path ) {
  return new Promise( async function ( resolve ) {
    let res = true;
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
      [res, out] = await parsingPythonMessage( mes );
    }
    resolve( [res, out] );
  });
}
async function parsingPythonMessage ( message ) {
  return new Promise( async function ( resolve ) {
    if ( message != null ) {
      let done    = true;
      let outPath = '';
      let lines   = message.split('\n');
      for ( var i=0; i<lines.length; i++ ) {
        if ( lines[i].length > 0 ) {
          let color = null;
          if ( lines[i].includes( '[ERROR]' ) ) {
            color = 'text-danger';
            done  = false;
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
      resolve( [false, outPath] );
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
    resolve( [true, ''] );
  });
}
async function pdmload ( data ) {
  return new Promise( async function ( resolve ) {
    luacli.newLine( 'Loading the lua script to the PDM...')
    resolve( [true, ''] );
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
    let res = true;
    let out = '';
    for ( var i=0; i<luaStages.length && res==true; i++ ) {
      [res, out] = await procStage( luaStages[i].callback, ( i == ( luaStages.length - 1 ) ), prevOut );
      if ( out != '' ) {
        prevOut = out;
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
      if ( result == true ) {
        await progress.setSeccess();
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