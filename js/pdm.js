const pdmDataAdr = {
  "DATA_ADR_UNIQUE_0"         : 0,
  "DATA_ADR_UNIQUE_1"         : 4,
  "DATA_ADR_UNIQUE_2"         : 8,
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
function LuaTelemetry () {
  var self = this;
  this.time    = 0;
  this.state   = 0;
  this.counter = 0;

  this.parsing = function ( blob, adr ) {
    self.time    = bytesToUint32( blob, adr );
    self.state   = blob[adr + 4];
    self.counter = blob[adr + 5];
    return 6;
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
}
function Version () {
  this.major = 0;
  this.minor = 0;
  this.patch = 0;
}
function Telemetry ( dinN, doutN, ainN ) {
  var self     = this;
  this.battery = 0;
  this.voltage = [];
  this.din     = [];
  this.dout    = [];
  this.lua     = new LuaTelemetry();
  this.length  = ( ainN + 1 ) * 4 + dinN + doutN * 10 + 6 ;
  this.parsing = function ( blob ) {
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
    //self.lua.parsing( blob, counter );
    self.lua.parsing( blob, ( self.length - 6 ) );
    return;
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
  }
  init();
}
function System () {
  var self        = this;
  this.uid        = 0;
  this.bootloader = new Version();
  this.firmware   = new Version();
  this.hardware   = new Version();
  this.lua        = new Version();
  this.length     = 12 + 4 * 3;
  this.parsing    = function ( blob ) {
    self.uid = bytesToUint32( blob, pdmDataAdr.DATA_ADR_UNIQUE_0 );
    self.uid = bytesToUint32( blob, pdmDataAdr.DATA_ADR_UNIQUE_1 );
    self.uid = bytesToUint32( blob, pdmDataAdr.DATA_ADR_UNIQUE_2 );
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

  const dinN     = 11;
  const doutN    = 20;
  const ainN     = 4;

  this.lua       = '';
  this.isCompil  = false;

  this.sysBlob       = [];
  this.telemetryBlob = [];

  this.system    = new System();
  this.telemetry = new Telemetry( dinN, doutN, ainN );

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
  return;
}

let pdm = new PDM();

module.exports.pdmDataAdr = pdmDataAdr;
module.exports.pdm        = pdm;