var pdm    = require('./pdm.js').pdm;
var pdmAdr = require('./pdm.js').pdmDataAdr;

const boolDic = [ '✕', '✓' ];
const cardDic = [ '', 'bg-success' ];
const cards = [
  {
    'id'   : 'card-status',
    'adr'  : pdmAdr.DATA_ADR_STATUS,
    'type' : 'class',
    'dic'  : [ '' ]
  },{
    'id'   : 'card-lua',
    'adr'  : pdmAdr.DATA_ADR_LUA,
    'type' : 'class',
    'dic'  : [ '' ]
  },{
    'id'   : 'card-battery',
    'adr'  : null,
    'type' : null
  },{
    'id'   : 'card-dout-1',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 0,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-2',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 1,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-3',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 2,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-4',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 3,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-5',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 4,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-6',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 5,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-7',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 6,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-8',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 7,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-9',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 8,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-10',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 9,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-11',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 10,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-12',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 11,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-13',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 12,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-14',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 13,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-15',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 14,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-16',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 15,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-17',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 16,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-18',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 17,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-19',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 18,
    'dic'  : cardDic
  },{
    'id'   : 'card-dout-20',
    'adr'  : pdmAdr.DATA_ADR_DOUT,
    'type' : 'class',
    'shif' : 19,
    'dic'  : cardDic
  },{
    'id'   : 'card-din',
    'adr'  : null,
    'type' : null
  },{
    'id'   : 'card-uin-1',
    'adr'  : null,
    'type' : null
  },{
    'id'   : 'card-uin-2',
    'adr'  : null,
    'type' : null
  },{
    'id'   : 'card-uin-3',
    'adr'  : null,
    'type' : null
  },{
    'id'   : 'card-uin-4',
    'adr'  : null,
    'type' : null
  },
]
const values = [
  {
    'id'   : 'value-status',
    'adr'  : pdmAdr.DATA_ADR_STATUS,
    'type' : 'string',
    'dic'  : [ 'ok' ]
  },{
    'id'   : 'value-lua',
    'adr'  : pdmAdr.DATA_ADR_LUA,
    'type' : 'string',
    'dic'  : [ 'ok' ]
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
  this.update = function () {
    updateCards();
    updateValues();
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
            if ( card.dic[data].length > 0 ) {
              obj.classList.add( card.dic[data] );
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