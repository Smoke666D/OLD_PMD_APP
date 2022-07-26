const remote = require('electron').remote;
var HID      = require('node-hid');
var usb      = require('./js/usb.js');
var rest     = require('./js/rest.js');
var alerts   = require('./js/alerts.js');

const USBMessage              = require('./js/usb-message.js').USBMessage;
const USB_DATA_SIZE           = require('./js/usb-message.js').USB_DATA_SIZE;
const USB_CHART_HEADER_LENGTH = require('./js/usb-message.js').USB_CHART_HEADER_LENGTH;
const USB_DATA_BYTE           = require('./js/usb-message.js').USB_DATA_BYTE;
const msgType                 = require('./js/usb-message.js').msgType;
const dashboard               = require('./js/dashboard.js').dashboard;

var scales = [ 0, 0, 0 ];
var lables = [ 'шт', 'c', 'м' ];
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
function parseConfigFromMsg( msg ){
  console.log( msg );
  return;
}

function error() {
  console.log("Error!!!");
}

function verifyIP( input ) {
  errorString   = "";
  theName       = "IPaddress";
  var ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  var ipArray   = input.match(ipPattern);
  if ( input == "0.0.0.0" ) {
    errorString = errorString +': '+ input + ' это специальный IP адрес и не может быть использован.';
  } else if ( input == "255.255.255.255" ) {
    errorString = errorString + ': ' + input + ' это специальный IP адрес и не может быть использован.';
  }
  if (ipArray == null) {
    errorString = errorString + ': ' + input + ' не допустимый IP адрес.';
  } else {
    for ( i=0; i<4; i++ ) {
      thisSegment = ipArray[i];
      if (thisSegment > 255) {
        errorString = errorString + ': ' + input + ' не допустимый IP адрес.';
        i = 4;
      }
      if ( ( i == 0 ) && ( thisSegment > 255 ) ) {
        errorString = errorString + ': ' + input + ' это специальный IP адрес и не может быть использован.';
        i = 4;
      }
    }
  }
  extensionLength = 3;
  return errorString
}

document.getElementById("disconnect-button").addEventListener('click', function() {
  resetSuccessConnection();
  usb.controller.close();
});


function connect () {
  /*--------------------------------------------------------------*/
  /*---------------------------- USB -----------------------------*/
  /*--------------------------------------------------------------*/
  if ( connectionType == 'usb' ) {
    var msg = null;
    if ( usb.controller.isConnected() == false ) {
      out           = [];
      charts        = [];
      measureBuffer = [];
      res           = usb.controller.init( function() {
        /* After getting full message */
        var buffer      = [];
        var dashboardFl = 0;
        buffer = usb.controller.getInput();
        measureBuffer = [];
        for ( var i=0; i<buffer.length; i++) {
          buffer[i].init( function() {
            if ( buffer[i].length > USB_DATA_SIZE ) {
              if ( buffer[i].adr != buffer[i-1].adr ) {
                msg = new USBMessage( buffer[i].buffer );
                msg.initLong();
              } else {
                for ( var j=USB_DATA_BYTE; j<buffer[i].buffer.length; j++ ) {
                  msg.addLong( buffer[i].buffer[j] );
                }
                if ( msg != null ) {
                }
              }
            } else {
              out = buffer[i].parse( dataReg );
              switch ( out[0] ) {
                case msgType.oilChart:
                  chartList[0].setData( out[1] );
                  chartList[0].clean();
                  chartList[0].getTypeFromReg( 0 );
                  chartList[0].init();
                  break;
                case msgType.oilDot:
                  chartList[0].setDot( ( buffer[i].adr - 1 ), out[1] );
                  break;
                case msgType.coolantChart:
                  chartList[1].setData( out[1] );
                  chartList[1].clean();
                  chartList[1].getTypeFromReg( 1 );
                  chartList[1].init();
                  break;
                case msgType.coolantDot:
                  chartList[1].setDot( ( buffer[i].adr - 1 ), out[1] );
                  break;
                case msgType.fuelChart:
                  chartList[2].setData( out[1] );
                  chartList[2].clean();
                  chartList[2].getTypeFromReg( 2 );
                  chartList[2].init();
                  break;
                case msgType.fuelDot:
                  chartList[2].setDot( ( buffer[i].adr - 1 ), out[1] );
                  break;
                case msgType.time:
                  rtcTime.get( out[1] );
                  break;
                case msgType.freeData:
                  freeDataValue[buffer[i].adr] = out[1];
                  break;
                case msgType.log:
                  logArray[buffer[i].adr] = out[1];
                  break;
                case msgType.measurement:
                  measureBuffer.push( out[1] );
                  break;
                case msgType.measurementLen:
                  measurementLength = out[1];
                  break;
                case msgType.output:
                  dashboardFl = 1;
              }
            }
          });
        }
        sdCard.update( freeDataValue[12], freeDataValue[13], freeDataValue[14], freeDataValue[15] );
        if ( charts.length == 3 ) {
          loadCharts( charts );
        }
        if ( dashboardFl == 0 ) {
          updateInterface( function () {
            let alert = new Alert( "alert-success", alerts.okIco, "Данные успешно обновленны" );
            usb.controller.enableLoop();
          });
        } else {
          dashboard.update( function () {
            usb.controller.resetLoopBusy();
          });
        }
        if ( measureBuffer.length != 0 ) {
          measureUpdate( measureBuffer, scales, lables );
        }
        /* outCallback */
        }, function() {
          let alert = new Alert( "alert-success", alerts.okIco, "Данные успешно переданы", 1 );
          measurementLength = 0;
          measureBuffer     = [];
          measureClean();
          usb.controller.enableLoop();
        /* errorCalback */
        }, function() {
          closeAllAlerts();
          setTimeout( function() {
            let alert = new Alert( "alert-warning", alerts.triIco, "Ошибка передачи данных по USB" );
          }, 1000 );

          usb.controller.close();
          usb.controller.disableLoop();
          resetSuccessConnection();
        /* unauthorizedCallback */
        }, function() {
          let alert = new Alert( "alert-warning", alerts.triIco, "Ошибка авторизации" );
        /* Forbidden callback*/
        }, function() {
          let alert = new Alert( "alert-warning", alerts.triIco, "Установка не остановлена. Доступ запрещен" );
        /* autoModeCallback */
        }, function() {
          let alert = new Alert( "alert-warning", alerts.triIco, "Контроллер в авто режиме. Запись настроек запрещена" );
        /* dashCallback */
        });
      if ( res == 1 ) {
        setTimeout( function () {
          setSuccessConnection();
          connectUpdate();
        }, 400 );
      }
    }
  /*--------------------------------------------------------------*/
  /*-------------------------- ETHERNET --------------------------*/
  /*--------------------------------------------------------------*/
  } else if ( connectionType == 'eth' ) {
    usb.controller.close();
    ipInput = document.getElementById("input-ipaddress");
    ipAdr   = ipInput.value;
    res     = verifyIP( ipAdr.toString() );
    if ( res == "" ) {
      setSuccessConnection();
      connectUpdate();
    } else {
      ipInput.value = "";
      let alert = new Alert( "alert-warning", alerts.triIco, res );
    }
  }
  return;
}


document.getElementById("connect-button").addEventListener('click', function() {
  connect();
});



module.exports.connect = connect;
