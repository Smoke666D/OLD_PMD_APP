const pdmDataAdr = {
  "DATA_ADR_UNIQUE_0"    : 0,
  "DATA_ADR_UNIQUE_1"    : 1,
  "DATA_ADR_UNIQUE_2"    : 2,
  "DATA_ADR_CURRENT_0"   : 3,
  "DATA_ADR_CURRENT_1"   : 4,
  "DATA_ADR_CURRENT_2"   : 5,
  "DATA_ADR_CURRENT_3"   : 6,
  "DATA_ADR_CURRENT_4"   : 7,
  "DATA_ADR_CURRENT_5"   : 8,
  "DATA_ADR_CURRENT_6"   : 9,
  "DATA_ADR_CURRENT_7"   : 10,
  "DATA_ADR_CURRENT_8"   : 11,
  "DATA_ADR_CURRENT_9"   : 12,
  "DATA_ADR_CURRENT_10"  : 13,
  "DATA_ADR_CURRENT_11"  : 14,
  "DATA_ADR_CURRENT_12"  : 15,
  "DATA_ADR_CURRENT_13"  : 16,
  "DATA_ADR_CURRENT_14"  : 17,
  "DATA_ADR_CURRENT_15"  : 18,
  "DATA_ADR_CURRENT_16"  : 19,
  "DATA_ADR_CURRENT_17"  : 20,
  "DATA_ADR_CURRENT_18"  : 21,
  "DATA_ADR_CURRENT_19"  : 22,
  "DATA_ADR_CURRENT_20"  : 23,
  "DATA_ADR_VOLTAGE_BAT" : 24,
  "DATA_ADR_VOLTAGE_0"   : 25,
  "DATA_ADR_VOLTAGE_1"   : 26,
  "DATA_ADR_VOLTAGE_2"   : 27,
  "DATA_ADR_VOLTAGE_3"   : 28,
  "DATA_ADR_DIN"         : 29,
  "DATA_ADR_DOUT"        : 30,
  "DATA_ADR_STATUS"      : 31,
  "DATA_ADR_LUA"         : 32
};

function PDM () {
  var self  = this;
  this.lua  = '';
  this.data = [];
  function init () {
    Object.keys( pdmDataAdr ).forEach( function () {
      self.data.push( 0 );
    });
    return;
  }
  init();
  return;
}

let pdm = new PDM();

module.exports.pdmDataAdr = pdmDataAdr;
module.exports.pdm        = pdm;