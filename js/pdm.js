const pdmDataAdr = {
  "DATA_ADR_UNIQUE"      : 0,
  "DATA_ADR_CURRENT_0"   : 1,
  "DATA_ADR_CURRENT_1"   : 2,
  "DATA_ADR_CURRENT_2"   : 3,
  "DATA_ADR_CURRENT_3"   : 4,
  "DATA_ADR_CURRENT_4"   : 5,
  "DATA_ADR_CURRENT_5"   : 6,
  "DATA_ADR_CURRENT_6"   : 7,
  "DATA_ADR_CURRENT_7"   : 8,
  "DATA_ADR_CURRENT_8"   : 9,
  "DATA_ADR_CURRENT_9"   : 10,
  "DATA_ADR_CURRENT_10"  : 11,
  "DATA_ADR_CURRENT_11"  : 12,
  "DATA_ADR_CURRENT_12"  : 13,
  "DATA_ADR_CURRENT_13"  : 14,
  "DATA_ADR_CURRENT_14"  : 15,
  "DATA_ADR_CURRENT_15"  : 16,
  "DATA_ADR_CURRENT_16"  : 17,
  "DATA_ADR_CURRENT_17"  : 18,
  "DATA_ADR_CURRENT_18"  : 19,
  "DATA_ADR_CURRENT_19"  : 20,
  "DATA_ADR_CURRENT_20"  : 21,
  "DATA_ADR_VOLTAGE_BAT" : 22,
  "DATA_ADR_VOLTAGE_0"   : 23,
  "DATA_ADR_VOLTAGE_1"   : 24,
  "DATA_ADR_VOLTAGE_2"   : 25,
  "DATA_ADR_VOLTAGE_3"   : 26,
  "DATA_ADR_DIN"         : 27,
  "DATA_ADR_DOUT"        : 28,
  "DATA_ADR_STATUS"      : 29,
  "DATA_ADR_LUA"         : 30
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