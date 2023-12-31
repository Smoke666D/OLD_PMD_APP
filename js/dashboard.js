var pdm    = require('./pdm.js').pdm;
var pdmAdr = require('./pdm.js').pdmDataAdr;

const statusDic     = ['Init', 'Run'       , 'Error'    , 'Stop'       , 'Restart' ];
const statusCardDic = [''    , 'bg-success', 'bg-danger',  'bg-warning', ''        ]; 
const doutStatusDic     = ['Off', 'Process'   , 'On'        , 'Error'    , 'Error'    , 'Restart'];
const doutStatusCardDic = [''   , 'bg-warning', 'bg-success', 'bg-danger', 'bg-danger', 'bg-info'];
const boolDic = [ '✕', '✓' ];
const cardDic = [ '', 'bg-success' ];
const cards = [
  {
    'id'   : 'card-lua',
    'adr'  : pdmAdr.DATA_ADR_LUA_STATUS,
    'type' : 'class',
    'dic'  : statusCardDic
  },{
    'id'   : 'card-runTime',
    'adr'  : null,
    'type' : null,
    'dic'  : []
  },{
    'id'   : 'card-errorCounter',
    'adr'  : null,
    'type' : null,
    'dic'  : []
  },{
    'id'   : 'card-battery',
    'adr'  : null,
    'type' : null,
    'dic'  : []
  },{
    'id'   : 'card-dout-1',
    'adr'  : pdmAdr.DATA_ADR_DOUT_0,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-2',
    'adr'  : pdmAdr.DATA_ADR_DOUT_1,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-3',
    'adr'  : pdmAdr.DATA_ADR_DOUT_2,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-4',
    'adr'  : pdmAdr.DATA_ADR_DOUT_3,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-5',
    'adr'  : pdmAdr.DATA_ADR_DOUT_4,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-6',
    'adr'  : pdmAdr.DATA_ADR_DOUT_5,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-7',
    'adr'  : pdmAdr.DATA_ADR_DOUT_6,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-8',
    'adr'  : pdmAdr.DATA_ADR_DOUT_7,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-9',
    'adr'  : pdmAdr.DATA_ADR_DOUT_8,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-10',
    'adr'  : pdmAdr.DATA_ADR_DOUT_9,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-11',
    'adr'  : pdmAdr.DATA_ADR_DOUT_10,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-12',
    'adr'  : pdmAdr.DATA_ADR_DOUT_11,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-13',
    'adr'  : pdmAdr.DATA_ADR_DOUT_12,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-14',
    'adr'  : pdmAdr.DATA_ADR_DOUT_13,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-15',
    'adr'  : pdmAdr.DATA_ADR_DOUT_14,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-16',
    'adr'  : pdmAdr.DATA_ADR_DOUT_15,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-17',
    'adr'  : pdmAdr.DATA_ADR_DOUT_16,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-18',
    'adr'  : pdmAdr.DATA_ADR_DOUT_17,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-19',
    'adr'  : pdmAdr.DATA_ADR_DOUT_18,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-dout-20',
    'adr'  : pdmAdr.DATA_ADR_DOUT_19,
    'type' : 'class',
    'shif' : 0,
    'dic'  : doutStatusCardDic
  },{
    'id'   : 'card-din',
    'adr'  : null,
    'type' : null,
    'dic'  : []
  },{
    'id'   : 'card-uin-1',
    'adr'  : null,
    'type' : null,
    'dic'  : []
  },{
    'id'   : 'card-uin-2',
    'adr'  : null,
    'type' : null,
    'dic'  : []
  },{
    'id'   : 'card-uin-3',
    'adr'  : null,
    'type' : null,
    'dic'  : []
  },{
    'id'   : 'card-uin-4',
    'adr'  : null,
    'type' : null,
    'dic'  : []
  },
]
const values = [
  {
    'id'   : 'value-lua',
    'adr'  : pdmAdr.DATA_ADR_LUA_STATUS,
    'type' : 'string',
    'dic'  : statusDic
  },{
    'id'   : 'value-runTime',
    'adr'  : pdmAdr.DATA_ADR_LUA_TIME,
    'type' : 'time',
  },{
    'id'   : 'value-errorCounter',
    'adr'  : pdmAdr.DATA_ADR_LUA_ERROR_COUNTER,
    'type' : 'uint8',
  },{
    'id'   : 'value-battery',
    'adr'  : pdmAdr.DATA_ADR_VOLTAGE_BAT,
    'type' : 'float'
  },{
    'id'   : 'value-dout-1',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_0,
    'type' : 'float'
  }, {
    'id'   : 'value-dout-2',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_1,
    'type' : 'float'
  },{
    'id'   : 'value-dout-3',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_2,
    'type' : 'float'
  }, {
    'id'   : 'value-dout-4',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_3,
    'type' : 'float'
  },{
    'id'   : 'value-dout-5',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_4,
    'type' : 'float'
  },{
    'id'   : 'value-dout-6',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_5,
    'type' : 'float'
  },{
    'id'   : 'value-dout-7',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_6,
    'type' : 'float'
  },{
    'id'   : 'value-dout-8',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_7,
    'type' : 'float'
  },{
    'id'   : 'value-dout-9',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_8,
    'type' : 'float'
  },{
    'id'   : 'value-dout-10',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_9,
    'type' : 'float'
  },{
    'id'   : 'value-dout-11',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_10,
    'type' : 'float'
  },{
    'id'   : 'value-dout-12',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_11,
    'type' : 'float'
  },{
    'id'   : 'value-dout-13',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_12,
    'type' : 'float'
  },{
    'id'   : 'value-dout-14',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_13,
    'type' : 'float'
  },{
    'id'   : 'value-dout-15',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_14,
    'type' : 'float'
  },{
    'id'   : 'value-dout-16',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_15,
    'type' : 'float'
  },{
    'id'   : 'value-dout-17',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_16,
    'type' : 'float'
  },{
    'id'   : 'value-dout-18',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_17,
    'type' : 'float'
  },{
    'id'   : 'value-dout-19',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_18,
    'type' : 'float'
  },{
    'id'   : 'value-dout-20',
    'adr'  : pdmAdr.DATA_ADR_CURRENT_19,
    'type' : 'float'
  },{
    'id'   : 'value-din-1',
    'adr'  : pdmAdr.DATA_ADR_DIN,
    'type' : 'bool',
    'shif' : 0,
    'dic'  : boolDic
  },{
    'id'   : 'value-din-2',
    'adr'  : pdmAdr.DATA_ADR_DIN,
    'type' : 'bool',
    'shif' : 1,
    'dic'  : boolDic
  },{
    'id'   : 'value-din-3',
    'adr'  : pdmAdr.DATA_ADR_DIN,
    'type' : 'bool',
    'shif' : 2,
    'dic'  : boolDic
  },{
    'id'   : 'value-din-4',
    'adr'  : pdmAdr.DATA_ADR_DIN,
    'type' : 'bool',
    'shif' : 3,
    'dic'  : boolDic
  },{
    'id'   : 'value-din-5',
    'adr'  : pdmAdr.DATA_ADR_DIN,
    'type' : 'bool',
    'shif' : 4,
    'dic'  : boolDic
  },{
    'id'   : 'value-din-6',
    'adr'  : pdmAdr.DATA_ADR_DIN,
    'type' : 'bool',
    'shif' : 5,
    'dic'  : boolDic
  },{
    'id'   : 'value-din-7',
    'adr'  : pdmAdr.DATA_ADR_DIN,
    'type' : 'bool',
    'shif' : 6,
    'dic'  : boolDic
  },{
    'id'   : 'value-din-8',
    'adr'  : pdmAdr.DATA_ADR_DIN,
    'type' : 'bool',
    'shif' : 7,
    'dic'  : boolDic
  },{
    'id'   : 'value-din-9',
    'adr'  : pdmAdr.DATA_ADR_DIN,
    'type' : 'bool',
    'shif' : 8,
    'dic'  : boolDic
  },{
    'id'   : 'value-din-10',
    'adr'  : pdmAdr.DATA_ADR_DIN,
    'type' : 'bool',
    'shif' : 9,
    'dic'  : boolDic
  },{
    'id'   : 'value-din-11',
    'adr'  : pdmAdr.DATA_ADR_DIN,
    'type' : 'bool',
    'shif' : 10,
    'dic'  : boolDic
  },{
    'id'   : 'value-din-12',
    'adr'  : pdmAdr.DATA_ADR_DIN,
    'type' : 'bool',
    'shif' : 11,
    'dic'  : boolDic
  },{
    'id'   : 'value-uin-1',
    'adr'  : pdmAdr.DATA_ADR_VOLTAGE_0,
    'type' : 'float'
  },{
    'id'   : 'value-uin-2',
    'adr'  : pdmAdr.DATA_ADR_VOLTAGE_1,
    'type' : 'float'
  },{
    'id'   : 'value-uin-3',
    'adr'  : pdmAdr.DATA_ADR_VOLTAGE_2,
    'type' : 'float'
  },{
    'id'   : 'value-uin-4',
    'adr'  : pdmAdr.DATA_ADR_VOLTAGE_3,
    'type' : 'float'
  },
];
/*----------------------------------------------------------------------------*/
function byteToFloat ( data ) {
  let out = 0;
  if ( data.length == 4 ) {
    var buf  = new ArrayBuffer( 4 );
    var view = new DataView( buf );
    for ( var i=0; i<4; i++ ) {
      view.setUint8( i, data[3-i] );
    }
    out = view.getFloat32( 0 );
  }
  return out;
}
/*----------------------------------------------------------------------------*/
function bytesToUint32 ( data ) {
  let out = 0;
  if ( data.length == 4 ) {
    for ( var i=0; i<4; i++ ) {
      out += data[i] << ( i * 8 );
    }
  }
  return out;
}
/*----------------------------------------------------------------------------*/
function mergeBytes ( data ) {
  let index = '';
  if ( data.length > 0 ) {
    data.forEach( function ( val ) {
      index = val.toString();
    });
  } else {
    index = '0';
  }
  return parseInt( index );
}
/*----------------------------------------------------------------------------*/
function Dashboard () {
  this.update = function ( callback ) {
    updateCards();
    updateValues();
    callback();
    return;
  }
  function updateCards () {
    cards.forEach( function ( card ) {
      if ( card.type != null ) {
        let obj  = document.getElementById( card.id );
        let data = mergeBytes( pdm.data[card.adr] );
        if ( 'shif' in Object.keys( card ) ) {
          data = ( data >> card.shif ) & 0x1;
        }
        switch ( card.type ) {
          case 'class':
            card.dic.forEach( function ( cl ) {
              if ( obj.classList.value.indexOf( cl ) > 0 ) {
                obj.classList.remove( cl );
              }
            });
            if ( card.dic.length >= data ) {
              if ( card.dic[data] != '' ) {
                obj.classList.add( card.dic[data] );
              }
            }
            break;
        } 
      }
    });
    return;
  }
  function updateValues () {
    values.forEach( function ( value ) {
      let obj  = document.getElementById( value.id );
      let data = pdm.data[value.adr];
      switch ( value.type ) {
        case 'float':
          obj.innerText = byteToFloat( data ).toFixed( 2 );
          break;
        case 'bool':
          obj.innerText = value.dic[ ( mergeBytes( data ) >> value.shif ) & 0x01 ];
          break;
        case 'string':
          obj.innerText = value.dic[mergeBytes( data )];
          break;
        case 'uint8':
          obj.innerText = data[0].toString();
          break;
        case 'uint32':
          obj.innerText = bytesToUint32( data ).toString();
          break;
        case 'time':
          obj.innerText = ( bytesToUint32( data ) * 10 ).toString();
          break;
      }
    });
    return;
  }
  function init () {
    return;
  }
  init();
  return;
}
/*----------------------------------------------------------------------------*/
let dashboard = new Dashboard();
module.exports.dashboard = dashboard;
/*----------------------------------------------------------------------------*/