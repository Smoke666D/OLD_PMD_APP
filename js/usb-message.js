
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
const msgSIZE = 14;
const msgCMD  = {
  "USB_GET_CONFIG_CMD"         : 1,
  "USB_PUT_CONFIG_CMD"         : 2,
  "USB_GET_CHART_OIL_CMD"      : 3,
  "USB_PUT_CHART_OIL_CMD"      : 4,
  "USB_GET_CHART_COOLANT_CMD"  : 5,
  "USB_PUT_CHART_COOLANT_CMD"  : 6,
  "USB_GET_CHART_FUEL_CMD"     : 7,
  "USB_PUT_CHART_FUEL_CMD"     : 8,
  "USB_PUT_EWA_CMD"            : 9,
  "USB_SAVE_CONFIG_CMD"        : 10,
  "USB_SAVE_CHART_CMD"         : 11,
  "USB_GET_TIME"               : 12,
  "USB_PUT_TIME"               : 13,
  "USB_GET_FREE_DATA"          : 14,
  'USB_PUT_FREE_DATA'          : 15,
  'USB_GET_LOG'                : 16,
  'USB_ERASE_LOG'              : 17,
  'USB_PUT_PASSWORD'           : 18,
  'USB_AUTHORIZATION'          : 19,
  'USB_ERASE_PASSWORD'         : 20,
  'USB_GET_MEMORY_SIZE'        : 21,
  'USB_GET_MEASUREMENT'        : 22,
  'USB_ERASE_MEASUREMENT'      : 23,
  'USB_GET_MEASUREMENT_LENGTH' : 24,
  'USB_GET_OUTPUT_CMD'         : 25,
  'USB_PUT_OUTPUT_CMD'         : 26,
};
const msgSTAT = {
  "USB_OK_STAT"           : 1,
  "USB_BAD_REQ_STAT"      : 2,
  "USB_NON_CON_STAT"      : 3,
  "USB_STAT_UNAUTHORIZED" : 4,
  "USB_FORBIDDEN"         : 5,
  "USB_INTERNAL"          : 6,
  "USB_AUTO_MODE"         : 7
};
const msgType = {
  "config"         : 1,
  "oilChart"       : 2,
  "oilDot"         : 3,
  "coolantChart"   : 4,
  "coolantDot"     : 5,
  "fuelChart"      : 6,
  "fuelDot"        : 7,
  "time"           : 8,
  "freeData"       : 9,
  "log"            : 10,
  "memorySize"     : 11,
  "measurement"    : 12,
  "measurementLen" : 13,
  "output"         : 14,
}
const USB_DIR_BYTE  = 0;
const USB_CMD_BYTE  = 1;
const USB_STAT_BYTE = 2;
const USB_ADR0_BYTE = 3;
const USB_LEN0_BYTE = 4;
const USB_DATA_BYTE = 5;
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
    buffer[USB_LEN0_BYTE] = self.length & 0xFF;
    self.data = [];
    callback();
    return;
  }
  function parsingCommandByte () {
    switch ( self.buffer[USB_CMD_BYTE] ) {
      case msgCMD.USB_GET_CONFIG_CMD:
        self.command = msgCMD.USB_GET_CONFIG_CMD;
        break;
      case msgCMD.USB_PUT_CONFIG_CMD:
        self.command = msgCMD.USB_PUT_CONFIG_CMD;
        break;
      case msgCMD.USB_GET_CHART_OIL_CMD:
        self.command = msgCMD.USB_GET_CHART_OIL_CMD;
        break;
      case msgCMD.USB_PUT_CHART_OIL_CMD:
        self.command = msgCMD.USB_PUT_CHART_OIL_CMD;
        break;
      case msgCMD.USB_GET_CHART_COOLANT_CMD:
        self.command = msgCMD.USB_GET_CHART_COOLANT_CMD;
        break;
      case msgCMD.USB_PUT_CHART_COOLANT_CMD:
        self.command = msgCMD.USB_PUT_CHART_COOLANT_CMD;
        break;
      case msgCMD.USB_GET_CHART_FUEL_CMD:
        self.command = msgCMD.USB_GET_CHART_FUEL_CMD;
        break;
      case msgCMD.USB_PUT_CHART_FUEL_CMD:
        self.command = msgCMD.USB_PUT_CHART_FUEL_CMD;
        break;
      case msgCMD.USB_PUT_EWA_CMD:
        self.command = msgCMD.USB_PUT_EWA_CMD;
        break;
      case msgCMD.USB_SAVE_CONFIG_CMD:
        self.command = msgCMD.USB_SAVE_CONFIG_CMD;
        break;
      case msgCMD.USB_SAVE_CHART_CMD:
        self.command = msgCMD.USB_SAVE_CHART_CMD;
        break;
      case msgCMD.USB_GET_TIME:
        self.command = msgCMD.USB_GET_TIME;
        break;
      case msgCMD.USB_PUT_TIME:
        self.command = msgCMD.USB_PUT_TIME;
        break;
      case msgCMD.USB_GET_FREE_DATA:
        self.command = msgCMD.USB_GET_FREE_DATA;
        break;
      case msgCMD.USB_PUT_FREE_DATA:
        self.command = msgCMD.USB_PUT_FREE_DATA;
        break;
      case msgCMD.USB_GET_LOG:
        self.command = msgCMD.USB_GET_LOG;
        break;
      case msgCMD.USB_ERASE_LOG:
        self.command = msgCMD.USB_ERASE_LOG;
        break;
      case msgCMD.USB_PUT_PASSWORD:
        self.command = msgCMD.USB_PUT_PASSWORD;
        break;
      case msgCMD.USB_AUTHORIZATION:
        self.command = msgCMD.USB_AUTHORIZATION;
        break;
      case msgCMD.USB_ERASE_PASSWORD:
        self.command = msgCMD.USB_ERASE_PASSWORD;
        break;
      case msgCMD.USB_GET_MEMORY_SIZE:
        self.command = msgCMD.USB_GET_MEMORY_SIZE;
        break;
      case msgCMD.USB_GET_MEASUREMENT:
        self.command = msgCMD.USB_GET_MEASUREMENT;
        break;
      case msgCMD.USB_ERASE_MEASUREMENT:
        self.command = msgCMD.USB_ERASE_MEASUREMENT;
        break;
      case msgCMD.USB_GET_MEASUREMENT_LENGTH:
        self.command = msgCMD.USB_GET_MEASUREMENT_LENGTH;
        break;
      case msgCMD.USB_GET_OUTPUT_CMD:
        self.command = msgCMD.USB_GET_OUTPUT_CMD;
        break;
      case msgCMD.USB_PUT_OUTPUT_CMD:
        self.command = msgCMD.USB_PUT_OUTPUT_CMD;
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
      case msgSTAT.USB_AUTO_MODE:
        self.status = msgSTAT.USB_AUTO_MODE;
        break;
      default:
        self.status = msgSTAT.USB_BAD_REQ_STAT;
        break;
    }
    return;
  }
  function parsingAddressByte () {
    self.adr = self.buffer[USB_ADR0_BYTE];
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
  function codeChart ( cmd, chart, adr ) {
    let data = [];
    if ( adr == 0 ) {
      data.push(   chart.size & 0x00FF );
      data.push( ( chart.size & 0xFF00 ) >> 8 );
    } else if ( ( adr - 1 ) <= CHART_DOTS_SIZE ) {
      data.push(     chart.dots[adr-1].x & 0x000000FF );
      data.push( ( ( chart.dots[adr-1].x & 0x0000FF00 ) >> 8 ) );
      data.push( ( ( chart.dots[adr-1].x & 0x00FF0000 ) >> 16 ) );
      data.push( ( ( chart.dots[adr-1].x & 0xFF000000 ) >> 24 ) );
      data.push(     chart.dots[adr-1].y & 0x000000FF );
      data.push( ( ( chart.dots[adr-1].y & 0x0000FF00 ) >> 8 ) );
      data.push( ( ( chart.dots[adr-1].y & 0x00FF0000 ) >> 16 ) );
      data.push( ( ( chart.dots[adr-1].y & 0xFF000000 ) >> 24 ) );
    }
    makeResponse( cmd, adr, data, data.length );
  }
  function parseOutput ( reg ) {
    reg.value = byteToUint16( self.data[0], self.data[1] );
    return;
  }
  function parseConfig ( reg ) {
    var counter = 0;
    /*----------- Configuration value -----------*/
    if ( reg.len == 1 ) {
      reg.value = byteToUint16( self.data[counter], self.data[counter + 1] );
      counter  += 2;
    } else {
      reg.value = [];
      for ( var i=0; i<reg.len; i++ ) {
        if ( reg.type == 'C' ) {
          let dig = byteToUint16( self.data[counter + i * 2], self.data[counter + i * 2 + 1] )
          if ( dig < 0x0020 ) {
            dig = 0x0020;
          }
          let buffer = "%" + dig.toString( 16 ).slice( 0, 2 ) + "%" + dig.toString( 16 ).slice( 2, 4 );
          if ( buffer.length == 4) {
            buffer = buffer.slice( 0, 3 );
          }
          let input = ' ';
          try {
            input = decodeURIComponent( buffer );
          } catch {
            input = ' ';
          }
          reg.value.push( input );
        } else {
          reg.value.push( byteToUint16( self.data[counter + i * 2], self.data[counter + i * 2 + 1] ) );
        }
      }
      counter += reg.len * 2;
    }
    /*-------------------------------------------*/
    return;
  }
  function parseDot () {
    var dot = new ChartDotData ();
    dot.x = byteToUint32( self.data[0], self.data[1], self.data[2], self.data[3] );
    dot.y = byteToUint32( self.data[4], self.data[5], self.data[6], self.data[7] );
    return dot;
  }
  function parseChart () {
    var chart  = new ChartData();
    chart.size  = byteToUint16( self.data[0], self.data[1] );
    return chart;
  }
  function parseTime () {
    time = new RTC();
    time.hour  = self.data[0];
    time.min   = self.data[1];
    time.sec   = self.data[2];
    time.year  = self.data[3];
    time.month = self.data[4];
    time.day   = self.data[5];
    time.wday  = self.data[6];
    return time;
  }
  function parseFreeData () {
    return byteToUint16( self.data[0], self.data[1] );
  }
  function parseLog () {
    let time   = byteToUint32( self.data[0], self.data[1], self.data[2], self.data[3] );
    time       = ( new Uint32Array( [time] ) )[0];
    let type   = self.data[4];
    let action = self.data[5];
    let record = new LogRecord( type, action, time );
    return record;
  }
  function parseMeasurement ( length ) {
    let measure = [];
    let size    = Math.trunc( length / 2 );
    for ( var i=0; i<size; i++ ) {
      measure.push( byteToUint16( self.data[i*2], self.data[i*2 + 1] ) );
    }
    return measure;
  }
  function parseMeasurementLength () {
    return byteToUint16( self.data[0], self.data[1] );
  }
  /*--------------------------------------------------------------------------*/
  this.init                   = function ( callback ) {
    parsingCommandByte();  /* Parsing command byte */
    parsingStateByte();    /* Parsing state byte */
    parsingAddressByte();  /* Parsing address bytes */
    parsingLengthByte();   /* Parsing length bytes */
    parsingDataBytes();    /* Parsing data bytes */
    /*--------------------------------------------------------*/
    callback();
    return;
  }
  this.initLong                     = function () {
    self.init( function() {
      if ( self.command == msgCMD.USB_GET_CHART_CMD ) {
        self.data.length = USB_CHART_HEADER_LENGTH;
      }
    });
    return;
  }
  this.addLong                      = function ( byte ) {
    if ( self.length > self.data.length ) {
      self.data.push( byte );
    }
    return;
  }
  this.makeConfigRequest            = function ( adr ) {
    makeRequest( msgCMD.USB_GET_CONFIG_CMD, adr );
    return;
  }
  this.makeOutputRequest            = function ( adr ) {
    makeRequest( msgCMD.USB_GET_OUTPUT_CMD, adr );
  }
  this.makeChartOilRequest          = function ( adr ) {
    makeRequest( msgCMD.USB_GET_CHART_OIL_CMD, adr );
    return;
  }
  this.makeChartCoolantRequest      = function ( adr ) {
    makeRequest( msgCMD.USB_GET_CHART_COOLANT_CMD, adr );
    return;
  }
  this.makeChartFuelRequest         = function ( adr ) {
    makeRequest( msgCMD.USB_GET_CHART_FUEL_CMD, adr );
    return;
  }
  this.makeTimeRequest              = function () {
    makeRequest( msgCMD.USB_GET_TIME, 0 );
    return;
  }
  this.makeFreeDataRequest          = function ( adr ) {
    makeRequest( msgCMD.USB_GET_FREE_DATA, adr );
    return;
  }
  this.makeLogRequest               = function ( adr ) {
    makeRequest( msgCMD.USB_GET_LOG, adr );
    return;
  }
  this.makeMeasurementRequest       = function ( adr ) {
    makeRequest( msgCMD.USB_GET_MEASUREMENT, adr );
    return;
  }
  this.makeMeasurementLengthRequest = function () {
    makeRequest( msgCMD.USB_GET_MEASUREMENT_LENGTH, 0 );
    return;
  }
  this.codeAuthorization            = function ( pas ) {
    let data = [ (pas & 0x00FF), ( ( pas & 0xFF00 ) >> 8 ) ];
    makeResponse( msgCMD.USB_AUTHORIZATION, 0, data, data.length );
    return;
  }
  this.codeLogErase                 = function () {
    makeRequest( msgCMD.USB_ERASE_LOG, 0 );
    return;
  }
  this.codePassword                 = function ( password ) {
    let data = [ ( password.status & 0xFF ), ( password.data & 0x00FF), ( ( password.data & 0xFF00 ) >> 8 ) ];
    makeResponse( msgCMD.USB_PUT_PASSWORD, 0, data, data.length );
    return;
  }
  this.codeTime                     = function ( time ) {
    let data = [ ( time.hour  & 0xFF ),
                 ( time.min   & 0xFF ),
                 ( time.sec   & 0xFF ),
                 ( time.year  & 0xFF ),
                 ( time.month & 0xFF ),
                 ( time.day   & 0xFF ),
                 ( time.wday  & 0xFF ),
               ];
    makeResponse( msgCMD.USB_PUT_TIME, 0, data, data.length );
    return;
  }
  this.codeOutput                   = function ( reg, adr ) {
    let data = [];
    data.push(   reg.value & 0x00FF );
    data.push( ( reg.value & 0xFF00 ) >> 8 );
    makeResponse( msgCMD.USB_PUT_OUTPUT_CMD, adr, data, data.length );
    return;
  }
  this.codeFreeData                 = function ( adr, data ) {
    let output = [ ( data & 0x00FF ), ( ( data & 0xFF00 ) >> 8 ) ];
    makeResponse( msgCMD.USB_PUT_FREE_DATA, adr, output, output.length );
    return;
  }
  this.codeConfig                   = function ( reg, adr ) {
    let data = [];
    if ( reg.len == 1 ) {
      data.push(   reg.value & 0x00FF );
      data.push( ( reg.value & 0xFF00 ) >> 8 );
    } else {
      for ( var i=0; i<reg.len; i++ ) {
        if ( reg.type == "C" ) {
          let char = codeCharToUtf8( reg.value[i] );
          data.push(   char & 0x00FF );
          data.push( ( char & 0xFF00 ) >> 8 );
        } else {
          data.push(   reg.value[i] & 0x00FF );
          data.push( ( reg.value[i] & 0xFF00 ) >> 8 );
        }
      }
    }
    makeResponse( msgCMD.USB_PUT_CONFIG_CMD, adr, data, data.length );
    return;
  }
  this.codeSaveConfigs              = function () {
    makeRequest( msgCMD.USB_SAVE_CONFIG_CMD, 0 );
    return;
  }
  this.codeSaveCharts               = function () {
    makeRequest( msgCMD.USB_SAVE_CHART_CMD, 0 );
    return;
  }
  this.codeChartOil                 = function ( chart, adr ) {
    codeChart( msgCMD.USB_PUT_CHART_OIL_CMD, chart, adr );
    return;
  }
  this.codeChartCoolant             = function ( chart, adr ) {
    codeChart( msgCMD.USB_PUT_CHART_COOLANT_CMD, chart, adr );
    return;
  }
  this.codeChartFuel                = function ( chart, adr ) {
    codeChart( msgCMD.USB_PUT_CHART_FUEL_CMD, chart, adr );
    return;
  }
  this.codeEWA                      = function ( ewa, index ) {
    let data    = [];
    var counter = index;
    for ( var i=USB_DATA_BYTE; i<msgSIZE; i++ ) {
      if ( ewa.length > counter ) {
        data.push( ewa[counter] );
      } else {
        data.push( 0x00 );
      }
      counter++;
    }
    makeResponse( msgCMD.USB_PUT_EWA_CMD, 0, data, ewa.length);
/*
    var counter  = index;
    self.status  = msgSTAT.USB_OK_STAT;
    self.command = msgCMD.USB_PUT_EWA_CMD;
    self.adr     = 0;
    setup( self.buffer, function () {
      for ( var i=USB_DATA_BYTE; i<msgSIZE; i++ ) {
        if ( ewa.length > counter ) {
          self.buffer.push( ewa[counter] );
        } else {
          self.buffer.push( 0x00 );
        }
        counter++;
      }
    });
    self.length = ewa.length;
    setupLength( self.buffer );
    */
    return counter;
  }
  this.codeMeasurementErase         = function () {
    makeRequest( msgCMD.USB_ERASE_MEASUREMENT, 0 );
    return;
  }
  this.parse                        = function ( configs ) {
    var output = 0;
    var type   = 0;
    switch ( self.command ) {
      case msgCMD.USB_GET_CONFIG_CMD:
        parseConfig( configs[self.adr] );
        type = msgType.config;
        break;
      case msgCMD.USB_GET_OUTPUT_CMD:
        parseOutput( outputReg[self.adr] );
        type = msgType.output;
        break;
      case msgCMD.USB_GET_CHART_OIL_CMD:
        if ( self.adr == 0 ) {
          output = parseChart();
          type   = msgType.oilChart;
        } else {
          output = parseDot();
          type   = msgType.oilDot;
        }
        break;
      case msgCMD.USB_GET_CHART_COOLANT_CMD:
        if ( self.adr == 0 ) {
          output = parseChart();
          type   = msgType.coolantChart;
        } else {
          output = parseDot();
          type   = msgType.coolantDot;
        }
        break;
      case msgCMD.USB_GET_CHART_FUEL_CMD:
        if ( self.adr == 0 ) {
          output = parseChart();
          type   = msgType.fuelChart;
        } else {
          output = parseDot();
          type   = msgType.fuelDot;
        }
        break;
      case msgCMD.USB_GET_TIME:
        output = parseTime();
        type   = msgType.time;
        break;
      case msgCMD.USB_GET_FREE_DATA:
        output = parseFreeData();
        type   = msgType.freeData;
        break;
      case msgCMD.USB_GET_LOG:
        output = parseLog();
        type   = msgType.log;
        break;
      case msgCMD.USB_GET_MEASUREMENT:
        output = parseMeasurement( self.length );
        type   = msgType.measurement;
        break;
      case msgCMD.USB_GET_MEASUREMENT_LENGTH:
        output = parseMeasurementLength();
        type   = msgType.measurementLen;
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
