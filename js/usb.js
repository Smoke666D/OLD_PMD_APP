/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
const remote          = require('electron').remote;
var HID               = require('node-hid');
const alerts          = require('./alerts.js');
const USBMessage      = require('./usb-message.js').USBMessage;
const msgCMD          = require('./usb-message.js').msgCMD;
const msgSTAT         = require('./usb-message.js').msgSTAT;
const USB_DATA_SIZE   = require('./usb-message.js').USB_DATA_SIZE;
/*----------------------------------------------------------------------------*/
const chartsLength = 3;
const loopTimeout  = 4000;
var   charts       = [];
/*----------------------------------------------------------------------------*/
const usbStat = {
  "wait"  : 1,
  "write" : 2,
  "read"  : 3,
  "dash"  : 4 };
const usbHandler = {
  "finish"       : 1,
  "error"        : 2,
  "continue"     : 3,
  "unauthorized" : 4,
  "forbidden"    : 5,
  "autoMode"     : 6 };
const usbInit = {
  "fail" : 0,
  "done" : 1 };
/*----------------------------------------------------------------------------*/
function MessageUnit ( data, adr ) {
  this.data = data;
  this.adr  = adr;
  return;
}
/*----------------------------------------------------------------------------*/
function MessageArray () {
  /*------------------ Private ------------------*/
  var self     = this;
  var sequence = [];
  var counter  = 0;
  /*------------------- Pablic ------------------*/
  this.getCurrentAdr = function () {
    if ( sequence.len == 0 ) {
      return 0xFFFF;
    } else {
      return sequence[sequence.length-1].adr;
    }
  }
  this.getLength     = function () {
    return sequence.length;
  }
  this.getCounter    = function () {
    return counter;
  }
  this.getProgress   = function () {
    return Math.ceil( ( ( counter + 1 ) / sequence.length ) * 100 );
  }
  this.incCounter    = function () {
    counter++;
    return;
  }
  this.getData       = function ( n ) {
    return sequence[n].data;
  }
  this.getFullData   = function () {
    let out = [];
    for ( var i=0; i<sequence.length; i++ ) {
      out.push( new USBMessage( sequence[i].data ) );
    }
    return out;
  }
  this.clean         = function () {
    sequence = [];
    counter  = 0;
    return;
  }
  this.resetCounter  = function () {
    counter = 0;
    return;
  }
  this.addMessage    = function ( message ) {
    if ( typeof message.buffer[0] == "object" ) {
      for ( var i=0; i<message.buffer.length; i++ ) {
        sequence.push( new MessageUnit( message.buffer[i], message.adr ) );
      }
    } else {
      sequence.push( new MessageUnit( message.buffer, message.adr ) );
    }
    return;
  }
  return;
}
function InputMessageArray () {
  /*------------------ Private ------------------*/
  var self     = this;
  var length   = 0;
  var response = new MessageArray();
  var request  = new MessageArray();
  /*------------------- Pablic ------------------*/
  this.getCurrentAdr = function () {
    return response.getCurrentAdr();
  }
  this.nextRequest   = function () {
    let output;
    if ( request.getCounter < request.getLength ) {
      output = request.getData( request.getCounter() );
      request.incCounter();
    }
    return output;
  }
  this.getProgress   = function () {
    return request.getProgress();
  }
  this.process       = function ( message ) {
    let result = usbHandler.error;
    if ( message.status == msgSTAT.USB_OK_STAT ) {
      if ( response.getLength() > 0 ) {
        if ( response.getCurrentAdr() != message.adr ) {
          length = 0;
        }
      } else {
        length = 0;
      }
      response.addMessage( message );
      length += USB_DATA_SIZE;
      if ( length >= message.length ) {
        result = usbHandler.finish;
      } else {
        result = usbHandler.continue;
      }
    } else {
      if ( message.status == msgSTAT.USB_BAD_REQ_STAT ) {
        result = usbHandler.error;
      } else if ( message.status == msgSTAT.USB_NON_CON_STAT ) {
        result = usbHandler.error;
      } else if ( message.status == msgSTAT.USB_FORBIDDEN ) {
        result = usbHandler.forbidden;
      } else if ( message.status == msgSTAT.USB_STAT_UNAUTHORIZED ) {
        result = usbHandler.unauthorized;
      } else if ( message.status == msgSTAT.USB_AUTO_MODE ) {
        result = usbHandler.autoMode;
      }
    }
    return result;
  }
  this.isEnd         = function () {
    let out = usbHandler.finish;
    if ( request.getCounter() < request.getLength() ) {
      out = usbHandler.continue;
    }
    return out;
  }
  this.clean         = function () {
    response.clean();
    request.clean();
    return;
  }
  this.addRequest    = function ( message ) {
    request.addMessage( message );
    request.resetCounter();
    return;
  }
  this.getData       = function () {
    return response.getFullData();
  }
  this.getLength     = function () {
    return length;
  }
  return;
}
function OutputMessageArray () {
  /*------------------ Private ------------------*/
  var self  = this;
  var array = new MessageArray();
  /*------------------- Pablic ------------------*/
  this.getCurrentAdr = function () {
    return array.getCurrentAdr();
  }
  this.nextMessage   = function () {
    let output;
    if ( array.getCounter() < array.getLength() ) {
      output = array.getData( array.getCounter() );
      array.incCounter();
    }
    return output;
  }
  this.getProgress   = function () {
    return array.getProgress();
  }
  this.isEnd         = function () {
    let out = usbHandler.finish
    if ( array.getCounter() < array.getLength() ) {
      out = usbHandler.continue;
    }
    return out;
  }
  this.clean         = function () {
    array.clean();
    return;
  }
  this.addMessage    = function ( message ) {
    array.addMessage( message );
    return;
  }
  this.printState    = function () {
    console.log( ( array.getCounter() * USB_DATA_SIZE ) + "/" + ( array.getLength() * USB_DATA_SIZE ) + " bytes ( " + ( array.getCounter() / array.getLength() * 100 ) + "% )" );
    return;
  }
  return;
}
function USBtransport () {
  /*------------------ Private ------------------*/
  var self   = this;
  var device = null;
  var output = new OutputMessageArray;
  var input  = new InputMessageArray;
  var status = usbStat.wait;
  var alert  = null;
  /*------------------- Pablic ------------------*/
  this.error         = [];
  this.errorCounter  = 0;
  /*------------------ Private ------------------*/
  function write ( data ) {
    if ( device != null ) {
      try {
        device.write( data );
      } catch (e) {
        if ( ( alert != null ) || ( alert != undefined ) ) {
          alert.close( 0 );
        }
      }
    }
    return;
  }
  function handler ( data ) {
    var result = usbHandler.finish;
    let input  = new USBMessage( data );
    switch ( status ) {
      case usbStat.wait:
        break;
      case usbStat.write:
        result = writeHandler( input );
        break;
      case usbStat.read:
        result = readHandler( input );
        break;
      default:
        break;
    }
    return result;
  }
  function writeHandler ( response ) {
    var result = usbHandler.continue;
    response.init( function () {
      if ( response.status == msgSTAT.USB_OK_STAT ) {
        if ( ( response.command == msgCMD.USB_PUT_CONFIG_CMD        ) ||
             ( response.command == msgCMD.USB_PUT_CHART_OIL_CMD     ) ||
             ( response.command == msgCMD.USB_PUT_CHART_COOLANT_CMD ) ||
             ( response.command == msgCMD.USB_PUT_CHART_FUEL_CMD    ) ||
             ( response.command == msgCMD.USB_SAVE_CONFIG_CMD       ) ||
             ( response.command == msgCMD.USB_SAVE_CHART_CMD        ) ||
             ( response.command == msgCMD.USB_PUT_TIME              ) ||
             ( response.command == msgCMD.USB_PUT_FREE_DATA         ) ||
             ( response.command == msgCMD.USB_ERASE_LOG             ) ||
             ( response.command == msgCMD.USB_PUT_PASSWORD          ) ||
             ( response.command == msgCMD.USB_ERASE_PASSWOR         ) ||
             ( response.command == msgCMD.USB_AUTHORIZATION         ) ||
             ( response.command == msgCMD.USB_ERASE_MEASUREMENT     ) ||
             ( response.command == msgCMD.USB_PUT_EWA_CMD  ) ) {
            result = output.isEnd();
            if ( result == usbHandler.continue )
            {
              alert.setProgressBar( output.getProgress() );
              write( output.nextMessage() );
              //output.printState();
            }
        } else {
          console.log("Error with command: " + response.command + " expected: " + msgCMD.USB_PUT_CONFIG_CMD + " or " + msgCMD.USB_PUT_CHART_CMD + " or " + msgCMD.USB_PUT_EWA_CMD );
          if ( alert != undefined ) {
            if ( ( alert != null ) || ( alert != undefined ) ) {
              alert.close( 0 );
            }
            self.close();
            if ( ( alert != null ) || ( alert != undefined ) ) {
              alert.close( 0 );
            }
            resetSuccessConnection();
          }
        }
      } else {
        if ( ( response.status == msgSTAT.USB_BAD_REQ_STAT ) || ( response.status == msgSTAT.USB_NON_CON_STAT ) ) {
          result = usbHandler.error;
        } else if ( response.status == msgSTAT.USB_FORBIDDEN ) {
          result = usbHandler.forbidden;
        } else if ( response.status == msgSTAT.USB_STAT_UNAUTHORIZED ) {
          result = usbHandler.unauthorized;
        } else if ( response.status == msgSTAT.USB_AUTO_MODE ) {
          result = usbHandler.autoMode;
        }
        if ( alert != undefined ) {
          if ( ( alert != null ) || ( alert != undefined ) ) {
            alert.close( 0 );
          }
        }
      }
    });
    return result;
  }
  function readHandler ( message ) {
    result = usbHandler.error;
    message.init( function () {
      result = input.process( message );
      if ( ( result == usbHandler.finish ) && ( input.isEnd() == usbHandler.continue ) ) {
        if ( alert != null ) {
          alert.setProgressBar( input.getProgress() );
        }
        write( input.nextRequest() );
        result = usbHandler.continue;
      }
      if ( ( result == usbHandler.error ) || ( result == usbHandler.unauthorized ) ) {
        if ( ( alert != null ) || ( alert != undefined ) ) {
          alert.close( 0 );
        }
      }
    });
    return result;
  }
  /*---------------------------------------------*/
  /*------------------- Pablic ------------------*/
  /*---------------------------------------------*/
  this.scan        = function ( success, fail ) {
    var devices = HID.devices();
    var res     = 0;
    device      = null;
    for ( var i=0; i<devices.length; i++ ) {
      if ( devices[i].manufacturer == "Energan" ) {
        device = new HID.HID( devices[i].path );
        res    = 1;
        success();
        break;
      }
    }
    if ( device == null ) {
      fail();
    }
    return res;
  }
  this.initEvents  = function ( inCallback, outCallback, errorCallback, unauthorizedCallback, forbiddenCallback, autoModeCallback, callback ) {
    device.on( "data", function( data ) {
      handle = handler( data );
      switch ( handle ) {
        case usbHandler.finish:
          switch ( status ) {
            case usbStat.write:
              status = usbStat.wait;
              outCallback();
              break;
            case usbStat.read:
              status = usbStat.wait;
              inCallback();
              break;
          }
          break;
        case usbHandler.forbidden:
          status = usbStat.wait;
          forbiddenCallback();
          break;
        case usbHandler.unauthorized:
          status = usbStat.wait;
          unauthorizedCallback();
          break;
        case usbHandler.autoMode:
          status = usbStat.wait;
          autoModeCallback();
          break;
        case usbHandler.error:
          status = usbStat.wait;
          self.close();
          errorCallback();
          break;
      }
    });
    device.on( "error", function( err ) {
      self.error.push( err );
      self.errorCounter++;
      status = usbStat.wait;
      self.close();
      errorCallback();
    });
    callback();
    return;
  }
  this.close       = function () {
    if ( device != null ) {
      device.close();
    }
    return;
  }
  this.getInput    = function () {
    return input.getData();
  }
  this.getStatus   = function () {
    return status;
  }
  this.clean       = function () {
    output.clean();
    input.clean();
    return;
  }
  this.addToOutput = function ( message ) {
    output.addMessage( message );
    return;
  }
  this.addRequest  = function ( message ) {
    input.addRequest( message );
    return;
  }
  this.start       = function ( dir, alertIn ) {
    alert = alertIn;
    switch ( dir ) {
      case usbStat.write:
        status = usbStat.write;
        if ( alertIn != null ) {
          alert.setProgressBar( output.getProgress() );
        }
        write( output.nextMessage() );
        break;
      case usbStat.read:
        status = usbStat.read;
        if ( alertIn != null ) {
          alert.setProgressBar( input.getProgress() );
        }
        write( input.nextRequest() );
        break;
      case usbStat.dash:
        status = usbStat.dash;
        if ( alertIn != null ) {
          alert.setProgressBar( input.getProgress() );
        }
        write( input.nextRequest() );
        break;
    }

  }
  /*---------------------------------------------*/
  /*---------------------------------------------*/
  /*---------------------------------------------*/
}
function EnerganController () {
  /*------------------ Private ------------------*/
  var self       = this;
  var transport  = null;
  var alert      = null;
  var loopActive = 0;
  var loopBusy   = 0;
  var connected  = false;
  /*---------------------------------------------*/
  function initWriteSequency ( adr, data, callback ) {
    var msg = null;
    transport.clean();
    /*--------------- Configurations ---------------*/
    grabInterface();
    for ( var i=0; i<dataReg.length; i++ ) {
      msg = new USBMessage( [] );
      msg.codeConfig( dataReg[i], i );
      transport.addToOutput( msg );
    }
    msg = new USBMessage( [] );
    msg.codeSaveConfigs();
    transport.addToOutput( msg );
    /*------------------- Charts -------------------*/
    charts = uploadCharts();
    for ( var i=0; i<(charts[0].size+1); i++ ) {
      msg = new USBMessage( [] );
      msg.codeChartOil( charts[0], i );
      transport.addToOutput( msg );
    }
    for ( var i=0; i<(charts[1].size+1); i++ ) {
      msg = new USBMessage( [] );
      msg.codeChartCoolant( charts[1], i );
      transport.addToOutput( msg );
    }
    for ( var i=0; i<(charts[2].size+1); i++ ) {
      msg = new USBMessage( [] );
      msg.codeChartFuel( charts[2], i );
      transport.addToOutput( msg );
    }
    msg = new USBMessage( [] );
    msg.codeSaveCharts();
    transport.addToOutput( msg );
    /*----------------------------------------------*/
    callback();
    return;
  }
  function initTimeWriteSequency ( adr, data, callback ) {
    let msg = new USBMessage([]);
    transport.clean();
    msg.codeTime( data );
    transport.addToOutput( msg );
    callback();
    return;
  }
  function initWriteEWA ( adr, ewa, callback ) {
    let msg   = null;
    let size  = Math.ceil( ewa.length / USB_DATA_SIZE );
    let index = 0;
    transport.clean();
    for ( var i=0; i<size; i++ ) {
      msg   = new USBMessage( [] );
      index = msg.codeEWA( ewa, index );
      transport.addToOutput( msg );
    }
    callback();
    return;
  }
  function initWriteFreeDataSequency ( adr, data, callback ) {
    let msg = new USBMessage( [] );
    transport.clean();
    msg.codeFreeData( adr, data );
    transport.addToOutput( msg );
    callback();
    return;
  }
  function initWriteOutputSequency ( adr, data, callback ) {
    let msg = new USBMessage( [] );
    transport.clean();
    msg.codeOutput( data, adr );
    transport.addToOutput( msg );
    callback();
    return;
  }
  function initWritePassSequency ( adr, data, callback ) {
    let msg = new USBMessage( [] );
    transport.clean();
    msg.codePassword( data );
    transport.addToOutput( msg );
    callback();
    return;
  }
  function initWriteAuthorSequency ( adr, data, callback ) {
    let msg = new USBMessage( [] );
    transport.clean();
    msg.codeAuthorization( data );
    transport.addToOutput( msg );
    callback();
    return;
  }
  function initWriteEraseLog ( adr, data, callback ) {
    let msg = new USBMessage( [] );
    transport.clean();
    msg.codeLogErase();
    transport.addToOutput( msg );
    callback();
    return;
  }
  function initWriteEraseMeasurment ( adr, data, callback ) {
    let msg = new USBMessage( [] );
    transport.clean();
    msg.codeMeasurementErase();
    transport.addToOutput( msg );
    callback();
    return;
  }
  function initReadSequency ( adr, password, callback ) {
    var msg = null;
    transport.clean();
    /*-------- Authorization --------*/
    msg = new USBMessage( [] );
    msg.codeAuthorization( password );
    transport.addRequest( msg );
    /*-------- Configurations -------*/
    for ( var i=0; i<dataReg.length; i++ ) {
      msg = new USBMessage( [] );
      msg.makeConfigRequest( i );
      transport.addRequest( msg );
    }
    /*---------- Oil chart ----------*/
    for ( var i=0; i<(CHART_DOTS_SIZE + 1); i++ ) {
      msg = new USBMessage( [] )
      msg.makeChartOilRequest( i );
      transport.addRequest( msg );
    }
    /*-------- Coolant chart --------*/
    for ( var i=0; i<(CHART_DOTS_SIZE + 1); i++ ) {
      msg = new USBMessage( [] )
      msg.makeChartCoolantRequest( i );
      transport.addRequest( msg );
    }
    /*--------- Fuel chart ----------*/
    for ( var i=0; i<(CHART_DOTS_SIZE + 1); i++ ) {
      msg = new USBMessage( [] )
      msg.makeChartFuelRequest( i );
      transport.addRequest( msg );
    }
    /*---------- Free data ----------*/
    for ( var i=0; i<freeDataValue.length; i++ ) {
      msg = new USBMessage( [] )
      msg.makeFreeDataRequest( i );
      transport.addRequest( msg );
    }
    /*------------- Log -------------*/
    for ( var i=0; i<logMaxSize; i++ ) {
      msg = new USBMessage( [] )
      msg.makeLogRequest( i );
      transport.addRequest( msg );
    }
    /*------------ Time -------------*/
    msg = new USBMessage( [] )
    msg.makeTimeRequest();
    transport.addRequest( msg );
    /*----- Measurement Length ------*/
    //msg = new USBMessage( [] );
    //msg.makeMeasurementLengthRequest();
    //transport.addRequest( msg );
    /*-------------------------------*/
    callback();
    return;
  }
  function initReadOutputSequency ( adr, data, callback ) {
    transport.clean();
    for ( var i=0; i<outputReg.length; i++ )
    {
      let msg = new USBMessage( [] )
      msg.makeOutputRequest( i );
      transport.addRequest( msg );
    }
    callback();
    return;
  }
  function initReadMeasurementSequency ( adr, data, callback ) {
    transport.clean();
    for ( var i=0; i<size; i++ ) {
      let msg = new USBMessage( [] );
      msg.makeMeasurementRequest( i );
      transport.addRequest( msg );
    }
    callback();
    return;
  }
  function awaitLoopBusyReset ( callback ) {
    if ( ( loopBusy > 0 ) && ( transport.getStatus != usbStat.wait ) ) {
      setTimeout( function () {
        console.log( "Await loop reset ");
          awaitLoopBusyReset( callback );
      }, 100 );
    } else {
      callback();
    }
    return;
  }
  function sendSequency ( adr, data, alert, cmd, sync, makeSeqCallBack ) {
    function startSeq () {
      makeSeqCallBack( adr, data, function () {
        transport.start( cmd, alert );
        return;
      });
      return;
    }
    if ( sync == false ) {
      awaitLoopBusyReset( function () {
        startSeq();
      });
    } else if ( transport.getStatus() == usbStat.wait ) {
      startSeq();
    }
    return;
  }
  function writeSequency ( adr, data, alert, sync, makeSeqCallBack ) {
    sendSequency( adr, data, alert, usbStat.write, sync, makeSeqCallBack );
    return;
  }
  function readSequency ( adr, data, alert, sync, makeSeqCallBack ) {
    sendSequency( adr, data, alert, usbStat.read, sync, makeSeqCallBack );
    return;
  }
  /*---------------------------------------------*/
  this.init              = function ( inCallback, outCallback, errorCalback, unauthorizedCallback, forbiddenCallback, automodeCallback ) {
    var result = usbInit.fail;
    var handle = usbHandler.finish;
    transport  = new USBtransport();
    transport.scan( function () {
      transport.initEvents( inCallback, outCallback, errorCalback, unauthorizedCallback, forbiddenCallback, automodeCallback, function() {
        result    = usbInit.done;
        try {
          let alert = new Alert( "alert-success", alerts.okIco, "Контроллер подключен по USB" );
          connected = true;
        } catch (e) {}
      });
    }, function() {
      let alert = new Alert( "alert-warning", alerts.triIco, "Контроллер не подключен по USB" );
    });
    return result;
  }
  this.isConnected       = function () {
    return connected;
  }
  this.enableLoop        = function () {
    loopActive = 1;
    return;
  }
  this.disableLoop       = function () {
    loopActive = 0;
    return;
  }
  this.resetLoopBusy     = function () {
    loopBusy = 0;
    return;
  }
  this.getStatus         = function () {
    let out = usbStat.dash
    if ( loopActive == 0 ) {
      out = transport.getStatus();
    }
    return out;
  }
  this.close             = function () {
    self.disableLoop();
    loopBusy = 0;
    if ( transport != null ) {
      transport.close();
      transport = null;
    }
    connected = false;
    return;
  }
  this.getLoopTimeout    = function () {
    return loopTimeout;
  }
  this.loop              = function () {
    if ( ( loopActive > 0 ) && ( loopBusy == 0 ) ) {
      loopBusy = 1;
      this.readOutput();
    }
    return;
  }
  this.getInput          = function () {
    return transport.getInput();
  }
  this.sendTime          = function ( time ) {
    this.disableLoop();
    writeSequency( 0, time, null, false, initTimeWriteSequency );
    return;
  }
  this.sendFreeData      = function ( adr, data ) {
    this.disableLoop();
    writeSequency( adr, data, null, false, initWriteFreeDataSequency );
    return;
  }
  this.sendOutput        = function ( adr, data ) {
    this.disableLoop();
    writeSequency( adr, data, null, false, initWriteOutputSequency );
    return;
  }
  this.sendPass          = function ( password ) {
    this.disableLoop();
    writeSequency( 0, password, null, false, initWritePassSequency );
    return;
  }
  this.sendAuthorization = function ( password ) {
    this.disableLoop();
    writeSequency( 0, password, null, false, initWriteAuthorSequency );
    return;
  }
  this.getMode           = function ( callback ) {

  }
  this.send              = function ( alertIn = null ) {
    this.disableLoop();
    alert = alertIn;
    writeSequency( 0, 0, alert, false, initWriteSequency );
    return;
  }
  this.eraseLog          = function ( alertIn = null ) {
    this.disableLoop();
    alert = alertIn;
    writeSequency( 0, 0, alert, false, initWriteEraseLog );
    return;
  }
  this.readOutput        = function () {
    readSequency( 0, 0, null, true, initReadOutputSequency );
    return;
  }
  this.sendEWA           = function ( ewa, alertIn = null ) {
    this.disableLoop();
    alert = alertIn;
    writeSequency( 0, ewa, alert, false, initWriteEWA );
    return;
  }
  this.receive           = function ( password, alertIn = null ) {
    this.disableLoop();
    alert = alertIn;
    readSequency( 0, password, alert, false, initReadSequency );
    return;
  }
  /*----------------------------------------*/
  return;
}
//------------------------------------------------------------------------------
let controller = new EnerganController();
//------------------------------------------------------------------------------
module.exports.EnerganController = EnerganController;
module.exports.controller        = controller;
module.exports.Transport         = USBtransport;
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
