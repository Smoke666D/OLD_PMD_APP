const LuaCli = require('./lua-cli.js').LuaCli;
const ProgressStep = require('./ProgressStep.js').ProgressStep;
/*-----------------------------------------------------------------------------------*/
let luacli       = new LuaCli( 'lua-cli' );
let progressStep = new ProgressStep( 'progressStep-container' );
/*-----------------------------------------------------------------------------------*/
let luaproc = new LuaProcess( luacli, progressStep );
/*-----------------------------------------------------------------------------------*/
function luaopen () {
  return true;
}
function lualink () {
  return true;
}
function luacheck () {
  return true;
}
function luamin () {
  return true;
}
function luamake () {
  return true;
}
function pdmconnect () {
  return true;
}
function pdmload () {
  return true;
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

  this.start = function () {
    luaStages.forEach( function ( stage, i ) {
      procStage( stage.callback, ( i == ( luaStages.length - 1 ) ) );
    });
  }
  function procStage ( callback, isEnd ) {
    let res = false;
    progress.setLoading();
    res = callback();
    if ( res == true ) {
      progress.setSeccess();
      if ( isEnd == false ) {
        progress.next();
      }
    } else {
      progress.setError();
    }
    return res;
  }
  return;
}
/*-----------------------------------------------------------------------------------*/
module.exports.luaproc = luaproc;