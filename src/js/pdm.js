const fs = require( 'fs' );

const logFileName = "./log.csv";

const IDlength   = 12;
const pdmDataAdr = {
  "DATA_ADR_UNIQUE"           : 0,
  "DATA_ADR_BOOTLOADER_MAJOR" : 12,
  "DATA_ADR_BOOTLOADER_MINOR" : 13,
  "DATA_ADR_BOOTLOADER_PATCH" : 14,
  "DATA_ADR_FIRMWARE_MAJOR"   : 15,
  "DATA_ADR_FIRMWARE_MINOR"   : 16,
  "DATA_ADR_FIRMWARE_PATCH"   : 17,
  "DATA_ADR_HARDWARE_MAJOR"   : 18,
  "DATA_ADR_HARDWARE_MINOR"   : 19,
  "DATA_ADR_HARDWARE_PATCH"   : 20,
  "DATA_ADR_LUA_MAJOR"        : 21,
  "DATA_ADR_LUA_MINOR"        : 22,
  "DATA_ADR_LUA_PATCH"        : 23,
};
const pdmTelemetryAdr = {
  "TELEMETRY_ADR_BATTERY" : 0,
  "TELEMETRY_ADR_VOLATGE" : 1,
  "TELEMETRY_ADR_DIN"     : 2,
  "TELEMETRY_ADR_DOUT"    : 3,
  "TELEMETRY_ADR_LUA"     : 4,
};
/*----------------------------------------------------------------------------*/
function byteToFloat ( data, adr ) {
  let out = 0;
  if ( data.length >= ( 4 + adr ) ) {
    var buf  = new ArrayBuffer( 4 );
    var view = new DataView( buf );
    for ( var i=0; i<4; i++ ) {
      view.setUint8( i, data[adr + 3 - i] );
    }
    out = view.getFloat32( 0 );
  }
  return out;
}
/*----------------------------------------------------------------------------*/
function bytesToUint32 ( data, adr ) {
  let out = 0;
  if ( data.length >= ( adr + 4 ) ) {
    for ( var i=0; i<4; i++ ) {
      out += data[adr + i] << ( i * 8 );
    }
  }
  return out;
}
/*----------------------------------------------------------------------------*/
function bytesToUint16 ( data ) {
  let out = 0;
  if ( data.length == 2 ) {
    for ( var i=0; i<2; i++ ) {
      out += data[i] << ( i * 8 );
    }
  }
  return out;
}
/*----------------------------------------------------------------------------*/
function byteToIDstring ( data, adr ) {
  let out = '';
  for ( var i=0; i<IDlength; i++ ) {
    let number =  data[adr + i].toString( 16 ).toUpperCase();
    if ( number.length == 1 ) {
      number = '0' + number;
    }
    out += number + ':';
  }
  return out.substring( 0, ( out.length - 1 ) );
}
/*----------------------------------------------------------------------------*/
function LuaTelemetry () {
  var self = this;

  const errorStringLength = 100;
  const blobSize = 6;

  this.time    = 0;  /* The current time periode for the one LUA running */
  this.state   = 0;  /* Current satate of the LUA machine */
  this.counter = 0;  /* Counter of the errors */
  this.error   = ''; /* Rintime error string */

  this.getBlobLength = function () {
    return blobSize;
  }
  this.getErrorStringLength = function () {
    return errorStringLength;
  }
  this.parsing = function ( blob, adr ) {
    self.time    = bytesToUint32( blob, adr );
    self.state   = blob[adr + 4];
    self.counter = blob[adr + 5];
    return blobSize;
  }
  this.noErrorString = function () {
    self.error = '';
  }
  this.errorParsing = function ( blob ) {
    self.error = '';
    for ( var i=0; i<blob.length; i++ ) {
      if ( blob[i] == 0 ) {
        break;
      }
      self.error += String.fromCharCode( blob[i] );
    }
    console.log( self.error );
    return; 
  }
}
function DoutTelemetry () {
  var self = this;
  this.current = 0;
  this.max     = 0;
  this.state   = 0;
  this.error   = 0;

  this.parsing = function ( blob, adr ) {
    self.current = byteToFloat( blob, adr );
    self.max     = byteToFloat( blob, ( adr + 4 ) );
    self.state   = blob[adr + 8];
    self.error   = blob[adr + 9];
    return 10;
  }
  this.makeHeader = function ( n ) {
    let out = '';
    out += 'DOUTcurrent_' + n.toString() + ';';
    out += 'DOUTmax_'     + n.toString() + ';';
    out += 'DOUTstate_'   + n.toString() + ';';
    out += 'DOUTerror_'   + n.toString();
    return out;
  }
  this.makeLog = function () {
    let out = '';
    out += self.current.toString() + ';' + self.max.toString() + ';' + self.state.toString() + ';' + self.error.toString();
    return out;
  }
}
function Version () {
  var self = this;
  this.major = 0;
  this.minor = 0;
  this.patch = 0;
  this.getString = function () {
    return self.major + '.' + self.minor + '.' + self.patch;
  }
}
function Telemetry ( dinN, doutN, ainN, velN ) {
  var self      = this;
  this.battery  = 0;
  this.voltage  = [];
  this.din      = [];
  this.dout     = [];
  this.velocity = [];
  this.lua      = new LuaTelemetry();
  this.length   = ( ainN + 1 ) * 4 + dinN + ( doutN * 10 ) + self.lua.getBlobLength() + ( velN * 2 );
  this.parsing  = function ( blob ) {
    self.battery = byteToFloat( blob, 0 );
    var counter = 4;
    for ( var i=0; i<self.voltage.length; i++ ) {
      self.voltage[i] = byteToFloat( blob, counter );
      counter += 4;
    }
    for ( var i=0; i<self.din.length; i++ ) {
      self.din[i] = blob[counter];
      counter += 1;
    }
    for ( var i=0; i<self.dout.length; i++ ) {
      counter += self.dout[i].parsing( blob, counter );
    }
    counter += self.lua.parsing( blob, counter );
    for ( var i=0; i<self.velocity.length; i++ ) {
      self.velocity[i][0] = blob[counter];
      counter++;
      self.velocity[i][1] = blob[counter];
      counter++;
    }
    return;
  }
  this.makeLogHeader = function () {
    let out = '';
    out += 'Time;';
    out += 'LUA state;LUA time;LUA counter;';
    out += 'batter;';
    for ( var i=0; i<self.voltage.length; i++ ) {
      out += 'voltage_' + i.toString() + ';';
    }
    for ( var i=0; i<self.din.length; i++ ) {
      out += 'din_' + i.toString() + ';';
    }
    self.dout.forEach( function( dout, i ) {
      out += dout.makeHeader( i ) + ';';
      return;
    });
    for ( var i=0; i<self.velocity.length; i++ ) {
      out += 'velocity_' + i.toString() + ';';
    }
    out += '\n';
    return out;
  }
  this.makeLogLine = function () {
    let out = '';
    /* Time stamp */
    const timeStamp = new Date( Date.now() ).toUTCString();
    out += timeStamp + ';';
    /* LUA machine data */
    out += self.lua.state.toString() + ';' + self.lua.time.toString()  + ';' + self.lua.counter.toString() + ';';
    /* Telemetry data */
    out += self.battery + ';';
    self.voltage.forEach( function ( value ) {
      out += value.toString() + ';';
      return;
    });
    self.din.forEach( function ( value ) {
      out += value.toString() + ';';
      return;
    });
    self.dout.forEach( function ( dout ) {
      out += dout.makeLog() + ';';
      return;
    });
    self.velocity.forEach( function ( value ) {
      out += bytesToUint16( value ).toString() + ';';
      return;
    });
    out += '\n';
    return out;
  }
  function init () {
    for ( var i=0; i<dinN; i++ ) {
      self.din.push( 0 );
    }
    for ( var i=0; i<doutN; i++ ) {
      self.dout.push( new DoutTelemetry() );
    }
    for ( var i=0; i<ainN; i++ ) {
      self.voltage.push( 0 );
    }
    for ( var i=0; i<velN; i++ ) {
      self.velocity.push( Array( 0, 0 ) );
    }
  }
  init();
}
function System () {
  var self        = this;
  this.uid        = '00:00:00:00:00:00:00:00:00:00:00:00';
  this.bootloader = new Version();
  this.firmware   = new Version();
  this.hardware   = new Version();
  this.lua        = new Version();
  this.length     = 12 + 4 * 3;
  this.parsing    = function ( blob ) {
    self.uid              = byteToIDstring( blob, pdmDataAdr.DATA_ADR_UNIQUE );
    self.bootloader.major = blob[pdmDataAdr.DATA_ADR_BOOTLOADER_MAJOR];
    self.bootloader.minor = blob[pdmDataAdr.DATA_ADR_BOOTLOADER_MINOR];
    self.bootloader.patch = blob[pdmDataAdr.DATA_ADR_BOOTLOADER_PATCH];
    self.firmware.major   = blob[pdmDataAdr.DATA_ADR_FIRMWARE_MAJOR];
    self.firmware.minor   = blob[pdmDataAdr.DATA_ADR_FIRMWARE_MINOR];
    self.firmware.patch   = blob[pdmDataAdr.DATA_ADR_FIRMWARE_PATCH];
    self.hardware.major   = blob[pdmDataAdr.DATA_ADR_HARDWARE_MAJOR];
    self.hardware.minor   = blob[pdmDataAdr.DATA_ADR_HARDWARE_MINOR];
    self.hardware.patch   = blob[pdmDataAdr.DATA_ADR_HARDWARE_PATCH];
    self.lua.major        = blob[pdmDataAdr.DATA_ADR_LUA_MAJOR];
    self.lua.minor        = blob[pdmDataAdr.DATA_ADR_LUA_MINOR];
    self.lua.patch        = blob[pdmDataAdr.DATA_ADR_LUA_PATCH];
    return;
  }
}
function PDM () {
  var self       = this;
  /*------------------------------------------------------------------------------- */
  const dinN     = 11;
  const doutN    = 20;
  const ainN     = 4;
  const velN     = 2;
  /*------------------------------------------------------------------------------- */
  this.lua       = '';
  this.isCompil  = false;
  /*------------------------------------------------------------------------------- */
  this.sysBlob         = [];
  this.telemetryBlob   = [];
  this.errorStringBlob = [];
  /*------------------------------------------------------------------------------- */
  this.system    = new System();
  this.telemetry = new Telemetry( dinN, doutN, ainN, velN );
  /*------------------------------------------------------------------------------- */
  this.setSystem = function ( callback ) {
    self.system.parsing( self.sysBlob );
    self.sysBlob = [];
    callback();
    return;
  }
  this.setTelemetry = function ( callback ) {
    self.telemetry.parsing( self.telemetryBlob );
    self.telemetryBlob = [];
    callback();
    return;
  }
  this.setErrorString = function ( callback ) {
    console.log( self.errorStringBlob );
    console.log( self.errorStringBlob.length );
    self.telemetry.lua.errorParsing( self.errorStringBlob );
    self.errorStringBlob = [];
    callback();
    return;
  }
  this.log = function () {
    if ( fs.existsSync( logFileName ) == false ) {
      fs.writeFile( logFileName, self.telemetry.makeLogHeader(), function () {
        appendLogLine();
        return;
      })
    } else {
      appendLogLine();
    }
    return;
  }
  /*------------------------------------------------------------------------------- */
  function appendLogLine () {
    fs.appendFile( logFileName, self.telemetry.makeLogLine(), function ( error ) {
      if ( error ) {
        console.log( 'Error on log file append: ' + error )
      }
      return;
    });
    return;
  }
  /*------------------------------------------------------------------------------- */
  return;
}

let pdm = new PDM();

module.exports.pdmDataAdr = pdmDataAdr;
module.exports.pdm        = pdm;