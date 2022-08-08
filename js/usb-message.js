
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
const msgSIZE = 14;
const msgCMD  = {
  "USB_REPORT_CMD_START_WRITING" : 1,
  "USB_REPORT_CMD_WRITE_SCRIPT"  : 2,
  "USB_REPORT_CMD_END_WRITING"   : 3,
  "USB_REPORT_CMD_READ_SCRIPT"   : 4,
  "USB_REPORT_CMD_READ_DATA"     : 5
};
const msgSTAT = {
  "USB_OK_STAT"           : 1,
  "USB_BAD_REQ_STAT"      : 2,
  "USB_NON_CON_STAT"      : 3,
  "USB_STAT_UNAUTHORIZED" : 4,
  "USB_FORBIDDEN"         : 5,
  "USB_INTERNAL"          : 6
};
const msgType = {
  "lua"  : 1,
  "data" : 2
}
const USB_DIR_BYTE  = 0;
const USB_CMD_BYTE  = 1;
const USB_STAT_BYTE = 2;
const USB_ADR0_BYTE = 3;
const USB_ADR1_BYTE = 4;
const USB_ADR2_BYTE = 5;
const USB_ADR3_BYTE = 6;
const USB_LEN0_BYTE = 7;
const USB_DATA_BYTE = 8;
const USB_DATA_SIZE = msgSIZE - USB_DATA_BYTE;
const USB_CHART_HEADER_LENGTH = 54;
/*----------------------------------------------------------------------------*/
function USBMessage ( buffer ) {
  /*------------------ Private ------------------*/
  var self = this;
  /*------------------- Public ------------------*/
  this.command = 0;      /* Command of mrssage   */
  this.status  = 0;      /* Status of message    */
  this.adr     = 0;      /* Target address       */
  this.length  = 0;      /* Length of full data  */
  this.data    = [];     /* Data of message      */
  this.buffer  = buffer; /* Copy input buffer    */
  /*---------------------------------------------*/
  function byteToUint16 ( byte0, byte1 ) {
    return ( byte0 & 0xFF ) | ( ( byte1 & 0xFF ) << 8 );
  }
  function uint24ToByte ( data, byte0, byte1, byte2 ) {
    byte0 = ( data & 0x0000FF );
    byte1 = ( data & 0x00FF00 ) >> 8;
    byte2 = ( data & 0xFF0000 ) >> 16;
    return;
  }
  function byteToUint24 ( byte0, byte1, byte2 ) {
    return ( byte0 & 0xFF ) | ( ( byte1 & 0xFF ) << 8 ) | ( ( byte2 & 0xFF ) << 16 );
  }
  function byteToUint32 ( byte0, byte1, byte2, byte3 ) {
    return ( byte0 & 0x000000FF ) | ( ( byte1 << 8 ) & 0x0000FF00 ) | ( ( byte2 << 16 )  & 0x00FF0000 ) | ( ( byte3 << 24 )  & 0xFF000000 );
  }
  function strToEncodeByte ( str, length, output ) {
    for ( var i=0; i<str.length; i++ ) {
      output.push( str.charAt( i ).charCodeAt() );
    }
    if ( length > str.length ) {
      for ( var i=0; i<( length - str.length ); i++ ) {
        output.push( 0x00 );
      }
    }
    return;
  }
  function codeCharToUtf8 ( char ) {
    var buf = null;
    if ( char.length == 1 ) {
      buf = encodeURIComponent( char );
      if ( buf.length == 1 ) {
        buf = char.charCodeAt( 0 ).toString( 10 );
      } else {
        buf = parseInt( Number( "0x" + buf.slice( 1, 3 ) + buf.slice( 4, 6 ) ), 10 );
      }
    }
    return buf;
  }
  function encodeByteToStr ( data, length ) {
    var buffer = "";
    for ( var i=0; i<length; i++ ) {
      if ( data[i] != 0 ){
        buffer += String.fromCharCode( data[i] );
      }
    }
    return buffer;
  }
  function cleanBuffer ( buffer, callback ) {
    buffer = [];
    for( var i=0; i<6; i++ ){
      buffer.push( 0 );
    }
    callback();
    return;
  }
  function setup ( buffer, callback ) {
    buffer[USB_DIR_BYTE]  = 0x01;          /* 1st channel for sending via USB */
    buffer[USB_CMD_BYTE]  = self.command;
    buffer[USB_STAT_BYTE] = self.status;
    buffer[USB_ADR0_BYTE] = self.adr & 0xFF;
    buffer[USB_ADR1_BYTE] = ( self.adr >> 8  ) & 0xFF;
    buffer[USB_ADR2_BYTE] = ( self.adr >> 16 ) & 0xFF;
    buffer[USB_ADR3_BYTE] = ( self.adr >> 24 ) & 0xFF;
    buffer[USB_LEN0_BYTE] = self.length & 0xFF;
    self.data = [];
    callback();
    return;
  }
  function parsingCommandByte () {
    switch ( self.buffer[USB_CMD_BYTE] ) {
      case msgCMD.USB_REPORT_CMD_START_WRITING:
        self.command = msgCMD.USB_REPORT_CMD_START_WRITING;
        break;
      case msgCMD.USB_REPORT_CMD_WRITE_SCRIPT:
        self.command = msgCMD.USB_REPORT_CMD_WRITE_SCRIPT;
        break;
      case msgCMD.USB_REPORT_CMD_END_WRITING:
        self.command = msgCMD.USB_REPORT_CMD_END_WRITING;
        break;
      case msgCMD.USB_REPORT_CMD_READ_SCRIPT:
        self.command = msgCMD.USB_REPORT_CMD_READ_SCRIPT;
        break;
      case msgCMD.USB_REPORT_CMD_READ_DATA:
        self.command = msgCMD.USB_REPORT_CMD_READ_DATA;
        break;
      default:
        self.command = 0;
        self.status  = msgSTAT.USB_BAD_REQ_STAT;
        console.log("CMD error");
        break;
    }
    return;
  }
  function parsingStateByte () {
    switch ( self.buffer[USB_STAT_BYTE] ) {
      case msgSTAT.USB_OK_STAT:
        self.status = msgSTAT.USB_OK_STAT;
        break;
      case msgSTAT.USB_BAD_REQ_STAT:
        self.status = msgSTAT.USB_BAD_REQ_STAT;
        break;
      case msgSTAT.USB_NON_CON_STAT:
        self.status = msgSTAT.USB_NON_CON_STAT;
        break;
      case msgSTAT.USB_STAT_UNAUTHORIZED:
        self.status = msgSTAT.USB_STAT_UNAUTHORIZED;
        break;
      case msgSTAT.USB_FORBIDDEN:
        self.status = msgSTAT.USB_FORBIDDEN;
        break;
      case msgSTAT.USB_INTERNAL:
        self.status = msgSTAT.USB_INTERNAL;
        break;
      default:
        self.status = msgSTAT.USB_BAD_REQ_STAT;
        break;
    }
    return;
  }
  function parsingAddressByte () {
    self.adr = byteToUint32( self.buffer[USB_ADR0_BYTE], self.buffer[USB_ADR1_BYTE], self.buffer[USB_ADR2_BYTE], self.buffer[USB_ADR3_BYTE] );
    return;
  }
  function parsingLengthByte () {
    self.length = self.buffer[USB_LEN0_BYTE];
    return;
  }
  function parsingDataBytes () {
    if ( self.status != msgSTAT.USB_BAD_REQ_STAT ) {
      self.data   = [];
      for ( var i=USB_DATA_BYTE; i<msgSIZE; i++ ) {
        self.data.push( self.buffer[i] );
      }
    }
  }
  function setupLength ( buffer ) {
    buffer[USB_LEN0_BYTE] = self.length;
    return;
  }
  function finishMesageWithZero ( buffer ) {
    for ( var i=buffer.length; i<msgSIZE; i++ ) {
      buffer.push( 0 );
    }
  }
  function makeRequest ( cmd, adr ) {
    self.status  = msgSTAT.USB_OK_STAT;
    self.command = cmd;
    self.adr     = adr;
    self.length  = 0;
    self.data    = [];
    self.buffer  = [];
    for ( var i=0; i<USB_DATA_BYTE; i++ ) {
      self.buffer.push( 0 );
    }
    setup( self.buffer, function () {
      finishMesageWithZero( self.buffer );
    });
  }
  function makeResponse ( cmd, adr, data, length ) {
    self.status  = msgSTAT.USB_OK_STAT;
    self.command = cmd;
    self.adr     = adr;
    self.length  = length;
    self.data    = [];
    self.buffer  = [];
    for ( var i=0; i<USB_DATA_BYTE; i++ ) {
      self.buffer.push( 0 );
    }
    setup( self.buffer, function () {
      for ( var i=0; i<data.length; i++ ) {
        self.data.push( data[i] );
        self.buffer.push( data[i] );
      }
      finishMesageWithZero( self.buffer );
    });
  }
  /*--------------------------------------------------------------------------*/
  function parseLua () {

  }
  function parseData () {
    let out = [];
    for ( var i=0; i<self.length; i++ ) {
      out.push( self.data[i] );
    }
    return out;
  }
  /*--------------------------------------------------------------------------*/
  this.init = function ( callback ) {
    parsingCommandByte();  /* Parsing command byte */
    parsingStateByte();    /* Parsing state byte */
    parsingAddressByte();  /* Parsing address bytes */
    parsingLengthByte();   /* Parsing length bytes */
    parsingDataBytes();    /* Parsing data bytes */
    /*--------------------------------------------------------*/
    callback();
    return;
  }
  this.makeLuaRequest = function () {
    makeRequest( msgCMD.USB_REPORT_CMD_READ_SCRIPT, 0 );
    return;
  }
  this.makeDataRequest = function ( adr ) {
    makeRequest( msgCMD.USB_REPORT_CMD_READ_DATA, adr );
  }
  this.codeStartWriting = function () {
    makeRequest( msgCMD.USB_REPORT_CMD_START_WRITING, 0 );
    return;
  }
  this.codeFinishWriting = function () {
    makeRequest( msgCMD.USB_REPORT_CMD_END_WRITING, 0 );
    return;
  }
  this.codeLua = function( adr, length, script ) {
    let data = [];
    for ( var i=0; i<length; i++ ) {
      data.push( script[i].charCodeAt() & 0xFF );
    }
    makeResponse( msgCMD.USB_REPORT_CMD_WRITE_SCRIPT, adr, data, length );
    return;
  }
  this.codeTerminator = function ( adr ) {
    makeResponse( msgCMD.USB_REPORT_CMD_WRITE_SCRIPT, adr, [ 0 ], 1 );
  }
  this.parse = function () {
    var output = 0;
    var type   = 0;
    switch ( self.command ) {
      case msgCMD.USB_REPORT_CMD_WRITE_SCRIPT:
        output = parseLua();
        type   = msgType.lua;
        break;
      case msgCMD.USB_REPORT_CMD_READ_DATA:
        output = parseData();
        type   = msgType.data;
        break;
    }
    return [type, output];
  }
  /*---------------------------------------------*/
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.USBMessage              = USBMessage;
module.exports.msgCMD                  = msgCMD;
module.exports.msgSTAT                 = msgSTAT;
module.exports.msgType                 = msgType;
module.exports.USB_DATA_SIZE           = USB_DATA_SIZE;
module.exports.USB_DATA_BYTE           = USB_DATA_BYTE;
module.exports.USB_CHART_HEADER_LENGTH = USB_CHART_HEADER_LENGTH;
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
