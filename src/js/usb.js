/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
const remote          = require( 'electron' ).remote;
var HID               = require( 'node-hid' );
const alerts          = require( './alerts.js' );
const USBMessage      = require( './usb-message.js' ).USBMessage;
const msgCMD          = require( './usb-message.js' ).msgCMD;
const msgSTAT         = require( './usb-message.js' ).msgSTAT;
const USB_DATA_SIZE   = require( './usb-message.js' ).USB_DATA_SIZE;
const pdmDataAdr      = require( './pdm.js' ).pdmDataAdr;
const settings        = require( './settings.js' ).settings;
const pdm             = require( './pdm.js' ).pdm;
/*----------------------------------------------------------------------------*/
const usbStat = {
  "wait"  : 1,
  "write" : 2,
  "read"  : 3,
  "dash"  : 4,
  "error" : 5 };
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
  var sequence = [];
  var counter  = 0;
  /*------------------- Pablic ------------------*/
  this.print = () => {
    sequence.forEach( ( item ) => {
      console.log( item );
    })
    console.log( counter );
    return;
  }
  this.getCurrentAdr = () => {
    if ( sequence.len == 0 ) {
      return 0xFFFF;
    } else {
      return sequence[sequence.length-1].adr;
    }
  }
  this.getLength = () => {
    return sequence.length;
  }
  this.getCounter = () => {
    return counter;
  }
  this.getProgress = () => {
    return Math.ceil( ( ( counter + 1 ) / sequence.length ) * 100 );
  }
  this.incCounter = () => {
    counter++;
    return;
  }
  this.getData = ( n ) => {
    return sequence[n].data;
  }
  this.getFullData = () => {
    let out = [];
    for ( var i=0; i<sequence.length; i++ ) {
      out.push( new USBMessage( sequence[i].data ) );
    }
    return out;
  }
  this.clean = () => {
    sequence = [];
    counter  = 0;
    return;
  }
  this.resetCounter = () => {
    counter = 0;
    return;
  }
  this.addMessage = ( message ) => {
    if ( typeof message.buffer[0] == 'object' ) {
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
  this.printRequests = () => {
    request.print();
    return;
  }
  this.getCurrentAdr = () => {
    return response.getCurrentAdr();
  }
  this.nextRequest = () => {
    let output;
    if ( request.getCounter < request.getLength ) {
      output = request.getData( request.getCounter() );
      request.incCounter();
    }
    return output;
  }
  this.getProgress = () => {
    return request.getProgress();
  }
  this.process = ( message ) => {
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
      result = usbHandler.finish;
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
  this.isEnd = () => {
    let out = usbHandler.finish;
    if ( request.getCounter() < request.getLength() ) {
      out = usbHandler.continue;
    }
    return out;
  }
  this.clean = () => {
    response.clean();
    request.clean();
    return;
  }
  this.addRequest = ( message ) => {
    request.addMessage( message );
    request.resetCounter();
    return;
  }
  this.getData = () => {
    return response.getFullData();
  }
  this.getLength = () => {
    return length;
  }
  return;
}
function OutputMessageArray () {
  /*------------------ Private ------------------*/
  var self  = this;
  var array = new MessageArray();
  /*------------------- Pablic ------------------*/
  this.getCurrentAdr = () => {
    return array.getCurrentAdr();
  }
  this.nextMessage = () => {
    let output;
    if ( array.getCounter() < array.getLength() ) {
      output = array.getData( array.getCounter() );
      array.incCounter();
    }
    return output;
  }
  this.getProgress = () => {
    return array.getProgress();
  }
  this.isEnd = () => {
    let out = usbHandler.finish
    if ( array.getCounter() < array.getLength() ) {
      out = usbHandler.continue;
    }
    return out;
  }
  this.clean = () => {
    array.clean();
    return;
  }
  this.addMessage = ( message ) => {
    array.addMessage( message );
    return;
  }
  this.printState = () => {
    console.log( ( array.getCounter() * USB_DATA_SIZE ) + '/' + ( array.getLength() * USB_DATA_SIZE ) + ' bytes ( ' + ( array.getCounter() / array.getLength() * 100 ) + '% )' );
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
        console.log( 'output: ' );
        console.log( data );
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
    response.init( () => {
      if ( response.status == msgSTAT.USB_OK_STAT ) {
        if ( ( response.command == msgCMD.USB_REPORT_CMD_START_WRITING    ) ||
             ( response.command == msgCMD.USB_REPORT_CMD_WRITE_SCRIPT     ) ||
             ( response.command == msgCMD.USB_REPORT_CMD_END_WRITING      ) ||
             ( response.command == msgCMD.USB_REPORT_CMD_READ_SCRIPT      ) ||
             ( response.command == msgCMD.USB_REPORT_CMD_READ_DATA        ) ||
             ( response.command == msgCMD.USB_REPORT_CMD_READ_TELEMETRY   ) ||
             ( response.command == msgCMD.USB_REPORT_CMD_UPDATE_TELEMETRY ) ||
             ( response.command == msgCMD.USB_REPORT_CMD_RESTART_LUA      ) || 
             ( response.command == msgCMD.USB_REPORT_CMD_READ_ERROR_STR   ) ) {
          result = output.isEnd();
          if ( result == usbHandler.continue )
          {
            if ( alert != null ) {
              alert.setProgressBar( output.getProgress() );
            }
            write( output.nextMessage() );
          }
        } else {
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
    message.init( () => {
      result = input.process( message );
      if ( ( result == usbHandler.finish ) && ( input.isEnd() == usbHandler.continue ) ) {
        if ( alert != null ) {
          alert.setProgressBar( input.getProgress() );
        }
        write( input.nextRequest() );
        result = usbHandler.continue;
      } else if ( ( result == usbHandler.error ) || ( result == usbHandler.unauthorized ) ) {
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
  this.printRequests = () => {
    input.printRequests();
    return;
  }
  this.scan = ( success, fail ) => {
    var devices = HID.devices();
    var res     = 0;
    device      = null;
    for ( var i=0; i<devices.length; i++ ) {
      if ( ( devices[i].vendorId == settings.data.usb.uid ) && ( devices[i].productId == settings.data.usb.pid ) ) {
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
  this.initEvents  = ( inCallback, outCallback, errorCallback, unauthorizedCallback, forbiddenCallback, autoModeCallback, callback ) => {
    device.on( 'data', ( data ) => {
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
    device.on( 'error', ( err ) => {
      self.error.push( err );
      self.errorCounter++;
      status = usbStat.wait;
      self.close();
      errorCallback();      
    });
    callback();
    return;
  }
  this.close = () => {
    if ( device != null ) {
      device.close();
    }
    return;
  }
  this.getInput = () => {
    return input.getData();
  }
  this.getStatus = () => {
    return status;
  }
  this.getLoopBusy = () => {
    return loopBusy;
  }
  this.clean = () => {
    output.clean();
    input.clean();
    return;
  }
  this.addToOutput = ( message ) => {
    output.addMessage( message );
    return;
  }
  this.addRequest = ( message ) => {
    input.addRequest( message );
    return;
  }
  this.start = ( dir, alertIn ) => {
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
    return;
  }
  /*---------------------------------------------*/
  /*---------------------------------------------*/
  /*---------------------------------------------*/
}
function PdmController () {
  /*------------------ Private ------------------*/
  var self       = this;
  var transport  = null;
  var alert      = null;
  var loopActive = 0;
  var loopBusy   = 0;
  var connected  = false;
  var finsh      = false;
  var loopTime   = 0;
  /*---------------------------------------------*/  
  function initWriteSequency ( adr, data, callback ) {
    let buffer  = pdm.lua;
    let total   = Math.ceil( buffer.length / USB_DATA_SIZE );
    let out     = '';
    let length  = 0;
    let address = 4;
    let msg     = null;
    transport.clean();
    /*---------------------------------------------*/
    msg = new USBMessage( [] );
    msg.codeStartWriting();
    transport.addToOutput( msg );
    /*---------------------------------------------*/
    msg = new USBMessage( [] );
    msg.codeLuaLength( 0, pdm.lua.length );
    transport.addToOutput( msg );
    for ( var i=0; i<total; i++ ) {
      msg = new USBMessage( [] );
      if ( buffer.length > USB_DATA_SIZE ) {
        out    = buffer.subarray( 0, USB_DATA_SIZE );
        buffer = buffer.subarray( USB_DATA_SIZE );
        length = USB_DATA_SIZE;
      } else {
        out    = buffer.subarray( 0 );
        length = out.length;
      }
      msg.codeLua( address, length, out );
      transport.addToOutput( msg );
      address += USB_DATA_SIZE;
    }
    if ( pdm.isCompil == false ) {
      msg = new USBMessage( [] );
      msg.codeTerminator( pdm.lua.length + 4 );
      transport.addToOutput( msg );
    }
    /*---------------------------------------------*/
    msg = new USBMessage( [] );
    msg.codeFinishWriting();
    transport.addToOutput( msg );
    /*---------------------------------------------*/
    callback();
    return;
  }
  function initRestartSequency ( adr, data, callback ) {
    let msg = null;
    transport.clean();
    msg = new USBMessage( [] );
    msg.codeRestartLua();
    transport.addToOutput( msg );
    callback();
    return;
  }
  function initReadSequency ( adr, data, callback ) {
    var msg = null;
    transport.clean();
    msg = new USBMessage( [] );
    msg.codeUpdateTelemetry();
    transport.addRequest( msg );
    for ( var i=0; i<Math.ceil( pdm.system.length / USB_DATA_SIZE ); i++ ) {
      msg = new USBMessage( [] );
      msg.makeDataRequest( i * USB_DATA_SIZE );
      transport.addRequest( msg );
    }
    for ( var i=0; i<Math.ceil( pdm.telemetry.length / USB_DATA_SIZE ); i++ ) {
      msg = new USBMessage( [] );
      msg.makeTelemetryRequest( i * USB_DATA_SIZE );
      transport.addRequest( msg );
    }
    callback();
    return;
  }
  function initTelemetrySequency ( adr, data, callback ) {
    var msg = null;
    transport.clean();
    msg = new USBMessage( [] );
    msg.codeUpdateTelemetry();
    transport.addRequest( msg );
    for ( var i=0; i<Math.ceil( pdm.telemetry.length / USB_DATA_SIZE ); i++ ) {
      msg = new USBMessage( [] );
      msg.makeTelemetryRequest( i * USB_DATA_SIZE );
      transport.addRequest( msg );
    }
    callback();
    return;
  }
  function initErrorStringSequency ( adr, data, callback ) {
    var msg = null;
    transport.clean();
    for ( var i=0; i<Math.ceil( pdm.telemetry.lua.getErrorStringLength() / USB_DATA_SIZE ); i++ ) {
      msg = new USBMessage( [] );
      msg.makeErrorStringRequest( i * USB_DATA_SIZE )
      transport.addRequest( msg );
      console.log( msg.adr + ' ' + msg.command ) ;
    }
    console.log( '-------' );
    callback();
  }
  function initReadLuaSequency ( adr, data, callback ) {
    var msg = null;
    transport.clean();
    msg = new USBMessage( [] );
    msg.makeLuaRequest();
    transport.addRequest( msg );
    callback();
    return;
  }
  function awaitLoopBusyReset ( callback ) {
    if ( ( loopBusy > 0 ) && ( transport.getStatus != usbStat.wait ) ) {
      setTimeout( () => {
        console.log( 'Await loop reset ');
        awaitLoopBusyReset( callback );
      }, 100 );
    } else {
      callback();
    }
    return;
  }
  function sendSequency ( adr, data, alert, cmd, sync, makeSeqCallBack ) {
    function startSeq () {
      makeSeqCallBack( adr, data, () => {
        transport.start( cmd, alert );
        return;
      });
      return;
    }
    if ( sync == false ) {
      awaitLoopBusyReset( () => {
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
  this.init = ( inCallback, outCallback, errorCalback, unauthorizedCallback, forbiddenCallback, automodeCallback ) => {
    var result = usbInit.fail;
    var handle = usbHandler.finish;
    transport  = new USBtransport();
    transport.scan( () => {
      transport.initEvents( inCallback, outCallback, errorCalback, unauthorizedCallback, forbiddenCallback, automodeCallback, () => {
        result = usbInit.done;
        try {
          let alert = new Alert( 'alert-success', alerts.okIco, 'Контроллер подключен по USB' );
          connected = true;
        } catch (e) {}
      });
    }, () => {
      let alert = new Alert( 'alert-warning', alerts.triIco, 'Контроллер не подключен по USB' );
    });
    return result;
  }
  this.isConnected = () => {
    return connected;
  }
  this.enableLoop = () => {
    loopActive = 1;
    return;
  }
  this.disableLoop = () => {
    loopActive = 0;
    return;
  }
  this.resetLoopBusy = () => {
    loopActive = 1;
    loopBusy   = 0;
    return;
  }
  this.disableLoopWithResetBusy = () => {
    loopActive = 0;
    loopBusy   = 0;
    return;
  }
  this.getStatus = () => {
    let out = usbStat.dash
    if ( connected == true ) {
      out = usbStat.dash
      if ( loopActive == 0 ) {
        out = transport.getStatus();
      }
    } else {
      out = usbStat.error;
    }   
    return out;
  }
  this.getLoopBusy = () => {
    return loopBusy;
  }
  this.getLoopActive = () => {
    return loopActive;
  }
  this.getFinish = () => {
    return finish;
  }
  this.setFinish = () => {
    finish = true;
  }
  this.resetFinish = () => {
    finish = false;
    return;
  }
  this.close = () => {
    self.disableLoop();
    loopBusy = 0;
    if ( transport != null ) {
      transport.close();
      transport = null;
    }
    connected = false;
    return;
  }
  this.getLoopTimeout = () => {
    return settings.data.usb.timeout;
  }
  this.loop              = () => {
    if ( ( loopActive > 0 ) && ( loopBusy == 0 ) ) {
      console.log( 'loop time: ' + ( ( Date.now() - loopTime ) / 1000 ) + ' sec' );
      loopTime = Date.now();
      if ( settings.data.usb.loop == true ) {
        loopBusy = 1;
        this.readTelemetry();
      }
    }
    return;
  }
  this.getInput = () => {
    return transport.getInput();
  }
  this.send = ( alertIn = null ) => {
    this.disableLoop();
    alert = alertIn;
    writeSequency( 0, 0, alert, false, initWriteSequency );
    return;
  }
  this.readOutput = () => {
    readSequency( 0, 0, null, true, initReadSequency );
    return;
  }
  this.readTelemetry = () => {
    readSequency( 0, 0, null, true, initTelemetrySequency );
    return;
  }
  this.readErrorString = () => {
    self.disableLoop();
    readSequency( 0, 0, null, false, initErrorStringSequency );
    return;  
  }
  this.restartLua = () => {
    self.disableLoop();
    writeSequency( 0, 0, null, false, initRestartSequency );
    return;  
  }
  this.receive = function ( data = null, alertIn = null ) {
    this.disableLoop();
    alert = alertIn;
    readSequency( 0, data, alert, false, initReadSequency );
    return;
  }
  /*----------------------------------------*/
  return;
}
//------------------------------------------------------------------------------
let controller = new PdmController();
//------------------------------------------------------------------------------
module.exports.controller = controller;
module.exports.usbStat    = usbStat;
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
