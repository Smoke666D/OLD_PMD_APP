var pdm    = require('./pdm.js').pdm;
var pdmAdr = require('./pdm.js').pdmDataAdr;

const maxFloat = 200;
const minFloat = 0;

const doutErrorDic  = ["нет", "уставка", "перегр.", "обрыв"];
const statusDic     = ['Init', 'Run'       , 'Error'    , 'Stop'       , 'Restart' ];
const statusCardDic = [''    , 'bg-success', 'bg-danger',  'bg-warning', ''        ]; 
const doutStatusDic     = ['Off', 'Process'   , 'On'        , 'Error'    , 'Error'    , 'Restart'];
const doutStatusCardDic = [''   , 'bg-warning', 'bg-success', 'bg-danger', 'bg-danger', 'bg-info'];
const boolDic = [ '✕', '✓' ];
const cardDic = [ '', 'bg-success' ];
const cards = [
  {
    'id'     : 'card-lua',
    'adr'    : 0,
    'source' : 'lua',
    'type'   : 'class',
    'dic'    : statusCardDic
  },{
    'id'     : 'card-runTime',
    'adr'    : null,
    'source' : null,
    'type'   : null,
    'dic'    : []
  },{
    'id'     : 'card-errorCounter',
    'adr'    : null,
    'source' : null,
    'type'   : null,
    'dic'    : []
  },{
    'id'     : 'card-battery',
    'adr'    : null,
    'source' : null,
    'type'   : null,
    'dic'    : []
  },{
    'id'     : 'card-dout-1',
    'adr'    : 0,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-2',
    'adr'    : 1,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-3',
    'adr'    : 2,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-4',
    'adr'    : 3,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-5',
    'adr'    : 4,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-6',
    'adr'    : 5,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-7',
    'adr'    : 6,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-8',
    'adr'    : 7,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-9',
    'adr'    : 8,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-10',
    'adr'    : 9,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-11',
    'adr'    : 10,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-12',
    'adr'    : 11,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-13',
    'adr'    : 12,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-14',
    'adr'    : 13,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-15',
    'adr'    : 14,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-16',
    'adr'    : 15,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-17',
    'adr'    : 16,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-18',
    'adr'    : 17,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-19',
    'adr'    : 18,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-dout-20',
    'adr'    : 19,
    'source' : 'dout',
    'type'   : 'class',
    'shif'   : 0,
    'dic'    : doutStatusCardDic
  },{
    'id'     : 'card-din',
    'adr'    : null,
    'source' : null,
    'type'   : null,
    'dic'    : []
  },{
    'id'     : 'card-uin-1',
    'adr'    : null,
    'source' : null,
    'type'   : null,
    'dic'    : []
  },{
    'id'     : 'card-uin-2',
    'adr'    : null,
    'source' : null,
    'type'   : null,
    'dic'    : []
  },{
    'id'     : 'card-uin-3',
    'adr'    : null,
    'source' : null,
    'type'   : null,
    'dic'    : []
  },{
    'id'     : 'card-uin-4',
    'adr'    : null,
    'source' : null,
    'type'   : null,
    'dic'    : []
  },
]
const values = [
  {
    'id'     : 'value-lua',
    'adr'    : 0,
    'source' : 'luaStatus',
    'type'   : 'string',
    'dic'    : statusDic
  },{
    'id'     : 'value-runTime',
    'adr'    : 0,
    'source' : 'luaTime',
    'type'   : 'time',
  },{
    'id'     : 'value-errorCounter',
    'adr'    : 0,
    'source' : 'errorCounter',
    'type'   : 'uint8',
  },{
    'id'     : 'value-errorString',
    'adr'    : 0,
    'source' : 'errorString',
    'type'   : 'text'
  },{
    'id'     : 'value-battery',
    'adr'    : 0,
    'source' : 'battery',
    'type'   : 'float',
    'accur'  : 2
  },{
    'id'     : 'value-velocity-1',
    'adr'    : 0,
    'source' : 'velocity',
    'type'   : 'uint16'
  },{
    'id'     : 'value-velocity-2',
    'adr'    : 1,
    'source' : 'velocity',
    'type'   : 'uint16'
  },{
    'id'     : 'value-dout-1',
    'adr'    : 0,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-2',
    'adr'    : 1,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-3',
    'adr'    : 2,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  }, {
    'id'     : 'value-dout-4',
    'adr'    : 3,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-5',
    'adr'    : 4,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-6',
    'adr'    : 5,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-7',
    'adr'    : 6,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-8',
    'adr'    : 7,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-9',
    'adr'    : 8,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-10',
    'adr'    : 9,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-11',
    'adr'    : 10,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-12',
    'adr'    : 11,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-13',
    'adr'    : 12,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-14',
    'adr'    : 13,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-15',
    'adr'    : 14,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-16',
    'adr'    : 15,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-17',
    'adr'    : 16,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-18',
    'adr'    : 17,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-19',
    'adr'    : 18,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'value-dout-20',
    'adr'    : 19,
    'source' : 'current',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-1',
    'adr'    : 0,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-2',
    'adr'    : 1,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-3',
    'adr'    : 2,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-4',
    'adr'    : 3,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-5',
    'adr'    : 4,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-6',
    'adr'    : 5,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-7',
    'adr'    : 6,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-8',
    'adr'    : 7,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-9',
    'adr'    : 8,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-10',
    'adr'    : 9,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-11',
    'adr'    : 10,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-12',
    'adr'    : 11,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-13',
    'adr'    : 12,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-14',
    'adr'    : 13,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-15',
    'adr'    : 14,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-16',
    'adr'    : 15,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-17',
    'adr'    : 16,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-18',
    'adr'    : 17,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-19',
    'adr'    : 18,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'max-dout-20',
    'adr'    : 19,
    'source' : 'max',
    'type'   : 'float',
    'accur'  : 1
  },{
    'id'     : 'error-dout-1',
    'adr'    : 0,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-2',
    'adr'    : 1,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-3',
    'adr'    : 2,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-4',
    'adr'    : 3,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-5',
    'adr'    : 4,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-6',
    'adr'    : 5,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-7',
    'adr'    : 6,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-8',
    'adr'    : 7,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-9',
    'adr'    : 8,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-10',
    'adr'    : 9,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-11',
    'adr'    : 10,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-12',
    'adr'    : 11,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-13',
    'adr'    : 12,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-14',
    'adr'    : 13,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-15',
    'adr'    : 14,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-16',
    'adr'    : 15,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-17',
    'adr'    : 16,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-18',
    'adr'    : 17,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-19',
    'adr'    : 18,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'error-dout-20',
    'adr'    : 19,
    'source' : 'error',
    'type'   : 'string',
    'dic'    : doutErrorDic
  },{
    'id'     : 'value-din-1',
    'adr'    : 0,
    'source' : 'din',
    'type'   : 'bool',
    'dic'    : boolDic
  },{
    'id'     : 'value-din-2',
    'adr'    : 1,
    'source' : 'din',
    'type'   : 'bool',
    'dic'    : boolDic
  },{
    'id'     : 'value-din-3',
    'adr'    : 2,
    'source' : 'din',
    'type'   : 'bool',
    'dic'    : boolDic
  },{
    'id'     : 'value-din-4',
    'adr'    : 3,
    'source' : 'din',
    'type'   : 'bool',
    'dic'    : boolDic
  },{
    'id'     : 'value-din-5',
    'adr'    : 4,
    'source' : 'din',
    'type'   : 'bool',
    'dic'    : boolDic
  },{
    'id'     : 'value-din-6',
    'adr'    : 5,
    'source' : 'din',
    'type'   : 'bool',
    'dic'    : boolDic
  },{
    'id'     : 'value-din-7',
    'adr'    : 6,
    'source' : 'din',
    'type'   : 'bool',
    'dic'    : boolDic
  },{
    'id'     : 'value-din-8',
    'adr'    : 7,
    'source' : 'din',
    'type'   : 'bool',
    'dic'    : boolDic
  },{
    'id'     : 'value-din-9',
    'adr'    : 8,
    'source' : 'din',
    'type'   : 'bool',
    'dic'    : boolDic
  },{
    'id'     : 'value-din-10',
    'adr'    : 9,
    'source' : 'din',
    'type'   : 'bool',
    'dic'    : boolDic
  },{
    'id'     : 'value-din-11',
    'adr'    : 10,
    'source' : 'din',
    'type'   : 'bool',
    'dic'    : boolDic
  },{
    'id'     : 'value-uin-1',
    'adr'    : 0,
    'source' : 'voltage',
    'type'   : 'float',
    'accur'  : 2
  },{
    'id'     : 'value-uin-2',
    'adr'    : 1,
    'source' : 'voltage',
    'type'   : 'float',
    'accur'  : 2
  },{
    'id'     : 'value-uin-3',
    'adr'    : 2,
    'source' : 'voltage',
    'type'   : 'float',
    'accur'  : 2
  },{
    'id'     : 'value-uin-4',
    'adr'    : 3,
    'source' : 'voltage',
    'type'   : 'float',
    'accur'  : 2
  }
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
  this.update = function ( loging, callback ) {
    updateCards();
    updateValues();
    if ( loging == true ) {
      pdm.log();
    }
    callback();
    return;
  }
  function updateCards () {
    cards.forEach( function ( card ) {
      if ( card.type != null ) {
        let obj  = document.getElementById( card.id );
        let data = 0;
        switch ( card.source ) {
          case 'lua':
            data = pdm.telemetry.lua.state;
            break;
          case 'dout':
            data = pdm.telemetry.dout[card.adr].state;
            break;
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
      let data = 0;

      switch ( value.source ) {
        case 'luaStatus':
          data = pdm.telemetry.lua.state;
          break;
        case 'luaTime':
          data = pdm.telemetry.lua.time;
          break;
        case 'errorCounter':
          data = pdm.telemetry.lua.counter;
          break;
        case 'errorString':
          data = pdm.telemetry.lua.error;
          break;  
        case 'battery':
          data = pdm.telemetry.battery;
          break;
        case 'velocity':
          data = pdm.telemetry.velocity[value.adr];
          break;
        case 'current':
          data = pdm.telemetry.dout[value.adr].current;
          break;
        case 'max':
          data = pdm.telemetry.dout[value.adr].max;
          break;
        case 'error':
          data = pdm.telemetry.dout[value.adr].error;
          break;
        case 'din':
          data = pdm.telemetry.din[value.adr];
          break;
        case 'voltage':
          data = pdm.telemetry.voltage[value.adr];
          break;
      }
      switch ( value.type ) {
        case 'float':
          if ( data > maxFloat ) {
            obj.innerText = 'maxError';
          } else if ( data < minFloat ) {
            obj.innerText = 'minError';
          } else {
            obj.innerText = data.toFixed( value.accur ).toString();
          }
          break;
        case 'bool':
          obj.innerText = value.dic[data];
          break;
        case 'string':
          obj.innerText = value.dic[data];
          break;
        case 'text':
          obj.innerText = data;
          break;
        case 'uint8':
          obj.innerText = data.toString();
          break;
        case 'uint16':
          obj.innerText = bytesToUint16( data ).toString();
          break;
        case 'uint32':
          obj.innerText = bytesToUint32( data ).toString();
          break;
        case 'time':
          obj.innerText = ( data * 10 ).toString();
          break;
        default:
          obj.innerText = 'NaN';
          break;
      }
    });
    return;
  }
  return;
}
/*----------------------------------------------------------------------------*/
let dashboard = new Dashboard();
module.exports.dashboard = dashboard;
/*----------------------------------------------------------------------------*/