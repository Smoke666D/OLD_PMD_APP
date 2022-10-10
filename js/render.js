const remote    = require('electron').remote;
var HID         = require('node-hid');
var usb         = require('./usb.js');
var alerts      = require('./alerts.js');
var Alert       = require('./alerts.js').Alert;
var pdm         = require('./pdm.js').pdm;
const msgType   = require('./usb-message.js').msgType;
const dashboard = require('./dashboard.js').dashboard;
const settings  = require('./settings.js').settings;

var loopCounter = 0;
var loopTimeout = 100;
/*----------------------------------------------------------------------------*/
document.getElementById("min-btn").addEventListener("click", function (e) {
  var window = remote.getCurrentWindow();
  window.minimize();
});
document.getElementById("max-btn").addEventListener("click", function (e) {
  var window = remote.getCurrentWindow();
  if (!window.isMaximized()) {
    window.maximize();
  } else {
    window.unmaximize();
  }
});
document.getElementById("close-btn").addEventListener("click", function (e) {
  var window = remote.getCurrentWindow();
  window.close();
});
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
function dashLoop () {
  setTimeout( function () {
    loopCounter += loopTimeout;
    if ( loopCounter >= usb.controller.getLoopTimeout() ) {
      usb.controller.loop();
      loopCounter = 0;
    }
    dashLoop();
  }, loopTimeout );
}
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
function resetSuccessConnection () {
  document.getElementById( 'connectButton' ).classList.remove( 'btn-success' );
  document.getElementById( 'connectButton' ).classList.add( 'btn-primary' );
  document.getElementById( 'restartLuaButton' ).disabled = true;
  return;
}
function setSuccessConnection () {
  document.getElementById( 'connectButton' ).classList.remove( 'btn-primary' );
  document.getElementById( 'connectButton' ).classList.add( 'btn-success' );
  document.getElementById( 'restartLuaButton' ).disabled = false;
  return;
}
function connectPDMinit () {
  document.getElementById( 'restartLuaButton' ).addEventListener( 'click', function () { 
    if ( usb.controller.isConnected() == true ) {
      usb.controller.restartLua();
    }
    return;
  });
  document.getElementById( 'connectButton' ).addEventListener( 'click', function () {
    if ( usb.controller.isConnected() == false ) {
      connect();
    } else {
      resetSuccessConnection();
      usb.controller.close();
    }
    return;
  });
  return;
}

function updateInterface ( callback ) {
  document.getElementById('versionController').innerText = pdm.system.hardware.getString();
  document.getElementById('versionFirmware').innerText   = pdm.system.firmware.getString();
  document.getElementById('versionBootloader').innerText = pdm.system.bootloader.getString();
  document.getElementById('versionLua').innerText        = pdm.system.lua.getString();
  document.getElementById('uniqueNumber').innerText      = pdm.system.uid;
  callback();
  return;
}

function parsingFullMessages () {
  var dashFl = false;
  var dataFl = false;
  var loopFl = false;
  var buffer = usb.controller.getInput();
  for ( var i=0; i<buffer.length; i++ ) {
    buffer[i].init( function ( input ) {
      let out = input.parse();
      switch ( out[0] ) {
        case msgType.lua:
          pdm.lua += out[1];
          break;
        case msgType.data:
          for ( var i=0; i<out[1].length; i++ ) {
            pdm.sysBlob.push( out[1][i] );
          }
          dataFl = true;
          break;
        case msgType.telemetry:
          for ( var i=0; i<out[1].length; i++ ) {
            pdm.telemetryBlob.push( out[1][i] );
          }
          dashFl = true;
          break;
        case msgType.loop:
          loopFl = true;
          break;  
      }
      return;
    });
  }
  if ( dataFl == true ) {
    pdm.setSystem( function () {
      updateInterface( function () {
        let alert = new Alert( "alert-success", alerts.okIco, "Данные успешно обновленны" );
        usb.controller.enableLoop();
        return;
      });
    });
  }
  if ( dashFl == true ) {
    pdm.setTelemetry( function () {
      dashboard.update( function () {
        usb.controller.resetLoopBusy();
        return;
      });
    });
  }
  if ( loopFl == true ) {
    usb.controller.resetLoopBusy();
  }
  return;
}
function outCallback () {
  let alert = new Alert( "alert-success", alerts.okIco, "Данные успешно переданы", 1 );
  usb.controller.setFinish();
  usb.controller.enableLoop();
  return;
}
function errorCalback () {
  closeAllAlerts();
  setTimeout( function() {
    let alert = new Alert( "alert-warning", alerts.triIco, "Ошибка передачи данных по USB" );
  }, 1000 );
  usb.controller.close();
  usb.controller.disableLoop();
  resetSuccessConnection();
  return;
}
function unauthorizedCallback () {
  let alert = new Alert( "alert-warning", alerts.triIco, "Ошибка авторизации" );
  return;
}
function forbiddenCallback () {
  let alert = new Alert( "alert-warning", alerts.triIco, "Установка не остановлена. Доступ запрещен" );
  return;
}
function autoModeCallback () {
  let alert = new Alert( "alert-warning", alerts.triIco, "Контроллер в авто режиме. Запись настроек запрещена" );
  return;
}
function connectUpdate () {
  let state = usb.controller.getStatus();
  let alert = new Alert( "alert-warning", triIco, "ghe", 0, 0 );
  if ( ( state == 1 ) || ( state == 4 ) ) {
    let alert = new Alert( "alert-warning", triIco, "Загрузка", 0, 1 );
    usb.controller.receive( null, alert );
  }
  return;
}
function connect ( readAtStart = true ) {
  return new Promise( async function ( resolve ) {
    if ( usb.controller.isConnected() == false ) {
      let res = usb.controller.init( parsingFullMessages, outCallback, errorCalback, unauthorizedCallback, forbiddenCallback, autoModeCallback );
      if ( res == 1 ) {
        setTimeout( function () {
          setSuccessConnection();
          if ( readAtStart ) {
            connectUpdate();
          }
          resolve( 'Done!' );
        }, 400 );
      } else {
        resolve( false );
      }
    } else {
      resolve( 'already open' );
    }
  });
}

dashboard.update( function(){});
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
module.exports.connect        = connect;
module.exports.dashLoop       = dashLoop;
module.exports.connectPDMinit = connectPDMinit;
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/