const fs           = require( 'fs' );
const { dialog }   = require( 'electron' ).remote;
const LuaCli       = require( './lua-cli.js' ).LuaCli;
const ProgressStep = require( './ProgressStep.js' ).ProgressStep;
const Toolchain    = require( './toolchain.js' ).Toolchain;
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
async function luaopen () {
  return new Promise( function ( resolve ) {
    let res  = false;
    let path = dialog.showOpenDialog( { 
      title:      'Открыть lua',
      filters:    [{ name: 'lua', extensions: ['lua']}],
      properties: ['openFile'] 
    }).then( function ( result ) {
      if ( result.filePaths[0] != undefined ) {
        luaPath = result.filePaths[0];
        luacli.add( 'Openning ' + luaPath );
        fs.readFile( luaPath, 'utf8', function ( error, data ) {
          if ( error ) {
            resolve( false );    
          }
          lua = data;
          resolve( true );
        });
      } else {
        resolve( false );
      }
    }).catch( function ( error ) {
      resolve( false );
    });
  });
}
async function lualink () {
  return new Promise( async function ( resolve ) {
    let res = await toolchain.run( 'lualink' );
    if ( res == true ) {
      luacli.add( 'Linking lua script...')
    } else {
      luacli.add( 'Error with the lualink!' );
    }
    resolve( res );
  });
}
async function luacheck () {
  return new Promise( async function ( resolve ) {
    let res = await toolchain.run( 'luacheck' );
    if ( res == true ) {
      luacli.add( 'Checking lua script...')
    } else {
      luacli.add( 'Error with the luacheck!' );
    }
    resolve( res );
  });
}
async function luamin () {
  return new Promise( async function ( resolve ) {
    let res = await toolchain.run( 'luamin' );
    if ( res == true ) {
      luacli.add( 'Minify lua script...')
    } else {
      luacli.add( 'Error with the luamin!' );
    }
    resolve( res );
  });
}
async function luamake () {
  return new Promise( async function ( resolve ) {
    let res = await toolchain.run( 'luamake' );
    if ( res == true ) {
      luacli.add( 'Make lua script...')
    } else {
      luacli.add( 'Error with the luamake!' );
    }
    resolve( res );
  });
}
async function pdmconnect () {
  return new Promise( async function ( resolve ) {
    luacli.add( 'Try to connect to the PDM via USB...')
    resolve( true );
  });
}
async function pdmload () {
  return new Promise( async function ( resolve ) {
    luacli.add( 'Loading the lua script to the PDM...')
    resolve( true );
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

function LuaProcess ( icli, iprogress ) {
  let self     = this;
  let cli      = icli;
  let progress = iprogress;

  this.start = async function () {
    let res = true;
    for ( var i=0; i<luaStages.length && res==true; i++ ) {
      res = await procStage( luaStages[i].callback, ( i == ( luaStages.length - 1 ) ) );
    }
    return;
  }
  async function procStage ( callback, isEnd ) {
    return new Promise( function ( resolve ) {
      progress.setLoading();
      callback().then( function ( result ) {
        if ( result == true ) {
          progress.setSeccess();
          if ( isEnd == false ) {
            progress.next();
          }
          resolve( true );
        } else {
          progress.setError();
          resolve( false );
        } 
      });
    });
  }
  return;
}
/*-----------------------------------------------------------------------------------*/
module.exports.luaproc = luaproc;