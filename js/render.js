const remote    = require('electron').remote;
var HID         = require('node-hid');
var usb         = require('./usb.js');
var alerts      = require('./alerts.js');
var Alert       = require('./alerts.js').Alert;
var pdm         = require('./pdm.js');
const msgType   = require('./usb-message.js').msgType;
const dashboard = require('./dashboard.js').dashboard;

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
  return;
}
function setSuccessConnection () {
  document.getElementById( 'connectButton' ).classList.remove( 'btn-primary' );
  document.getElementById( 'connectButton' ).classList.add( 'btn-success' );
  return;
}
function connectPDMinit () {
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
function parsingFullMessages () {
  var dashFl = false;
  var buffer = usb.controller.getInput();
  pdm.lua    = '';
  for ( var i=0; i<buffer.length; i++ ) {
    buffer[i].init( function() {
      let out = buffer[i].parse( dataReg );
      switch ( out[0] ) {
        case msgType.lua:
          pdm.lua += out[1];
          break;
        case msgType.data:
          pdm.data[buffer[i].adr] = out[1];
          dashFl = true;
          break;
      }
      return;
    });
  }
  if ( dashFl == false ) {
    updateInterface( function () {
      let alert = new Alert( "alert-success", alerts.okIco, "Данные успешно обновленны" );
      usb.controller.enableLoop();
      return;
    });
  } else {
    dashboard.update( function () {
      usb.controller.resetLoopBusy();
      return;
    });
  }
  return;
}
function outCallback () {
  let alert = new Alert( "alert-success", alerts.okIco, "Данные успешно переданы", 1 );
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
  if ( ( state == 1 ) || ( state == 4 ) ) {
    let alert = new Alert( "alert-warning", triIco, "Загрузка", 0, 1 );
    usb.controller.receive( null, alert );
  }
  return;
}
function connect () {
  if ( usb.controller.isConnected() == false ) {
    let res = usb.controller.init( parsingFullMessages, outCallback, errorCalback, unauthorizedCallback, forbiddenCallback, autoModeCallback );
    if ( res == 1 ) {
      setTimeout( function () {
        setSuccessConnection();
        connectUpdate();
      }, 400 );
    }
  }
  return;
}
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
module.exports.connect        = connect;
module.exports.dashLoop       = dashLoop;
module.exports.connectPDMinit = connectPDMinit;
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/