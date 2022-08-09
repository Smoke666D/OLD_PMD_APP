/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
const remote = require('electron').remote;
var   usb    = require('usb');
const alerts = require('./alerts.js');
/*----------------------------------------------------------------------------*/
const minTransferSize = 2;
const maxTransferSize = 1024;
const defTransfSize   = maxTransferSize;
const dfu = {
  req : {
    DETACH                 : 0x00,  /* Requests the device to leave DFU mode and enter the application */
    DNLOAD                 : 0x01,  /* Requests data transfer from Host to the device in order to load them into device internal Flash memory. Includes also erase commands */
    UPLOAD                 : 0x02,  /* Requests data transfer from device to Host in order to load content of device internal Flash memory into a Host file */
    GETSTATUS              : 0x03,  /* Requests device to send status report to the Host (including status resulting from the last request execution and the state the device will enter immediately after this request) */
    CLRSTATUS              : 0x04,  /* Requests device to clear error status and move to next step */
    GETSTATE               : 0x05,  /* Requests the device to send only the state it will enter immediately after this request */
    ABORT                  : 0x06,  /* Requests device to exit the current state/operation and enter idle state immediately */
  },
  cmd : {
    SET_ADDR               : 0x21,
    ERASE                  : 0x41,
    READ_UNPROTECT         : 0x92,
  },
  state: {
    appIDLE                : 0x00,  /* Device is running its normal application */
    appDETACH              : 0x01,  /* Device is running its normal application, has received the DFU_DETACH request, and is waiting for a USB reset */
    dfuIDLE                : 0x02,  /* Device is operating in the DFU mode and is waiting for requests */
    dfuDNLOAD_SYNC         : 0x03,  /* Device has received a block and is waiting for the Host to solicit the status via DFU_GETSTATUS */
    dfuDNBUSY              : 0x04,  /* Device is programming a control-write block into its non volatile memories */
    dfuDNLOAD_IDLE         : 0x05,  /* Device is processing a download operation. Expecting DFU_DNLOAD requests */
    dfuMANIFEST_SYNC       : 0x06,  /* Device has received the final block of firmware from the Host and is waiting for receipt of DFU_GETSTATUS to begin the Manifestation phase or device has completed the Manifestation phase and is waiting for receipt of DFU_GETSTATUS. */
    dfuMANIFEST            : 0x07,  /* Device is in the Manifestation phase. */
    dfuMANIFEST_WAIT_RESET : 0x08,  /* Device has programmed its memories and is waiting for a USB reset or a power on reset. */
    dfuUPLOAD_IDLE         : 0x09,  /* The device is processing an upload operation. Expecting DFU_UPLOAD requests */
    dfuERROR               : 0x0A,  /* An error has occurred. Awaiting the DFU_CLRSTATUS request. */
  },
  status : {
    OK                     : 0x00,  /* No error condition is present */
    errTARGET              : 0x01,  /* File is not targeted for use by this device */
    errFILE                : 0x02,  /* File is for this device but fails some vendor-specific verification test */
    errWRITE               : 0x03,  /* Device id unable to write memory */
    errERASE               : 0x04,  /* Memory erase function failed */
    errCHECK_ERASED        : 0x05,  /* Memory erase check failed */
    errPROG                : 0x06,  /* Program memory function failed */
    errVERIFY              : 0x07,  /* Programmed memory failed verification */
    errADDRESS             : 0x08,  /* Cannot program memory due to received address that is out of range */
    errNOTDONE             : 0x09,  /* Received DFU_DNLOAD with wLength = 0, but device does not think it has all the data yet. */
    errFIRMWARE            : 0x0A,  /* Device’s firmware is corrupted. It cannot return to run-time operations */
    errVENDOR              : 0x0B,  /* iString indicates a vendor-specific error */
    errUSBR                : 0x0C,  /* Device detected unexpected USB reset signaling */
    errPOR                 : 0x0B,  /* Device detected unexpected power on reset */
    errUNKNOWN             : 0x0E,  /* Something went wrong, but the device does not know what it was */
    errSTALLEDPK           : 0x0F,  /* Device stalled an unexpected request */
  },
};
const bmRequestType = {
  read  : 0xA1,
  write : 0x21,
}
const sectorType = {
  r   : 'r',
  e   : 'e',
  re  : 're',
  w   : 'w',
  rw  : 'rw',
  ew  : 'ew',
  rew : 'rew',
}
/*----------------------------------------------------------------------------*/
function Sector ( id, adr, shift, size, readable, erasable, writable ) {
  this.id       = id;
  this.adr      = adr;      /* Start address of sector in bytes*/
  this.shift    = shift;    /* Shifting from Flash start in Kb */
  this.size     = size;     /* Size of sector in bytes */
  this.readable = readable;
  this.erasable = erasable;
  this.writable = writable;
  return;
}
function Map ( string ) {
  /*------------------ Private ------------------*/
  var strInd = 0;
  var endInd = 0;
  /*------------------- Public ------------------*/
  this.count    = 0;
  this.size     = 0;
  this.readable = 0;
  this.erasable = 0;
  this.writable = 0;
  /*---------------------------------------------*/
  strInd     = string.indexOf("*");
  endInd     = string.search("K");
  this.count = parseInt( string.substr( 0, strInd ) );
  this.size  = parseInt( string.substr( ( strInd + 1 ), endInd - 3 ) );
  switch ( string.substr( endInd+1, string.length )  ) {
    case 'a':
      this.readable = 1;
      this.erasable = 0;
      this.writable = 0;
      break;
    case 'b':
      this.readable = 0;
      this.erasable = 1;
      this.writable = 0;
      break;
    case 'c':
      this.readable = 1;
      this.erasable = 1;
      this.writable = 0;
      break;
    case 'd':
      this.readable = 0;
      this.erasable = 0;
      this.writable = 1;
      break;
    case 'e':
      this.readable = 1;
      this.erasable = 0;
      this.writable = 1;
      break;
    case 'f':
      this.readable = 0;
      this.erasable = 1;
      this.writable = 1;
      break;
    case 'g':
      this.readable = 1;
      this.erasable = 1;
      this.writable = 1;
      break;
  }
  /*---------------------------------------------*/
  return;
}
function Memory( string ) {
  /*------------------ Private ------------------*/
  var strInd    = 0;
  var midInd    = 0;
  var endInd    = 0;
  var endFl     = 0;
  var sectorStr = "";
  var adrCount  = 0;
  /*------------------- Public ------------------*/
  this.type    = "";
  this.start   = 0;
  this.size    = 0;
  this.map     = [];
  this.sectors = [];
  /*---------------------------------------------*/
  strInd = string.search("@");
  endInd = string.search("/");
  if ( ( strInd != -1 ) && ( endInd != -1 ) ) {
    this.type = string.substr( ( strInd + 1 ), ( endInd - 1 ) );
    string = string.substr( ( endInd + 1 ), string.length );
    endInd = string.search("/");
    if ( endInd != -1 ) {
      this.start = parseInt( string.substr( 0, endInd ) );
      string = string.substr( ( endInd + 1 ), string.length );
      while ( endFl == 0 ) {
        endInd = string.search(",");
        if ( endInd > 0 ) {
          this.map.push( new Map( string.substr( 0, endInd ) ) );
          this.size += this.map[this.map.length - 1].count * this.map[this.map.length - 1].size;
          string = string.substr( ( endInd + 1 ), string.length );
        } else {
          this.map.push( new Map( string ) );
          this.size += this.map[this.map.length - 1].count * this.map[this.map.length - 1].size;
          endFl = 1;
        }
      }
      adrCount = this.start;
      adrShift = 0;
      id       = 0;
      for ( var i=0; i<this.map.length; i++ ) {
        let rec = this.map[i];
        for ( var j=0; j<rec.count; j++ ) {
          this.sectors.push( new Sector( id, adrCount, adrShift, rec.size*1024, rec.readable, rec.erasable, rec.writable ) )
          id++;
          adrCount += rec.size*1024;
          adrShift += rec.size;
        }
      }
      this.size *= 1024;
    }
  }
  return;
}
function Status( raw ) {
  this.status  = raw[0];
  this.timeOut = raw[1];
  this.state   = raw[4];
  this.string  = raw[5];
}
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
function dfuDevice() {
  /*------------------ Private ------------------*/
  const ifaceN = 0;
  var   self   = this;
  var   device = null;
  var   iface  = null;
  var   opened = false;
  /*------------------- Public ------------------*/
  this.manufacturer = "No";
  this.product      = "No";
  this.serial       = "No";
  this.memory       = {};
  /*---------------------------------------------*/
  function       checkTransferSize( size ) {
    let result = size;
    if ( size < minTransferSize ) {
      result = minTransferSize;
    }
    if ( size > maxTransferSize ) {
      result = maxTransferSize;
    }
    return result;
  }
  function       getRequestType ( read_not_write ) {
    var out = 0;
    if ( read_not_write > 0 ) {
      out = bmRequestType.read;
    } else {
      out = bmRequestType.write;
    }
    return out;
  }
  function       strState ( state ) {
    var str = "No state";
    switch ( state ) {
      case dfu.state.appIDLE:
        str = "App idle"
        break;
      case dfu.state.appDETACH:
        str = "Detach"
        break;
      case dfu.state.dfuIDLE:
        str = "DFU idle"
        break;
      case dfu.state.dfuDNLOAD_SYNC:
        str = "Download synchronization"
        break;
      case dfu.state.dfuDNBUSY:
        str = "Download busy"
        break;
      case dfu.state.dfuDNLOAD_IDLE:
        str = "Download idle"
        break;
      case dfu.state.dfuMANIFEST_SYNC:
        str = "Manifest synchronization"
        break;
      case dfu.state.dfuMANIFEST:
        str = "Manifest"
        break;
      case dfu.state.dfuMANIFEST_WAIT_RESET:
        str = "Manifest wait reset"
        break;
      case dfu.state.dfuUPLOAD_IDLE:
        str = "Upload idle"
        break;
      case dfu.state.dfuERROR:
        str = "Error"
        break;
    }
    return str;
  }
  function       adrToHexStr ( adr ) {
    return "0x0" + adr.toString(16);
  }
  async function initBuffer ( cmd, adr ) {
    if ( adr == 0 ) {
      let data = Buffer.from( [cmd, ( adr & 0x000000FF ), ( ( adr & 0x0000FF00 ) >> 8 ), ( ( adr & 0x00FF0000 ) >> 16 ), ( ( adr & 0xFF000000 ) >> 24 ) ] );
    } else {
      let data = Buffer.from( [cmd] );
    }
    console.log( data );
    return data
  }
  async function asyncSleep ( ms ) {
    return new Promise( function ( resolve, reject ) {
      setTimeout( resolve, ms );
    });
  }
  /*---------------------------------------------*/
  this.print            = function () {
    console.log( '******** DFU *********' );
    console.log( 'Manufacturer: ' + self.manufacturer );
    console.log( 'Product:      ' + self.product      );
    console.log( 'Serial:       ' + self.serial       );
    console.log( 'Memory type:  ' + self.memory.type  );
    console.log( 'Memory start: 0x' + self.memory.start.toString(16) );
    console.log( 'Memory end:   0x' + ( self.memory.start + self.memory.size ).toString(16) );
    console.log( 'Memory size:  ' + ( self.memory.size / 1024 ) + ' Kb'  );
  }
  this.init             = async function ( callback ) {
    var result = 0;
    //device = usb.findByIds( 0x16D0, 0x10BD );
    device = usb.findByIds( 1155, 57105 );
    if ( device != null ) {
      try {
        device.open();
        device.getStringDescriptor( device.deviceDescriptor.iManufacturer, function( error, string ) {
          if ( error == undefined ) {
            self.manufacturer = string;
            device.getStringDescriptor( device.deviceDescriptor.iProduct, function( error, string ) {
              if ( error == undefined ) {
                self.product = string;
                device.getStringDescriptor( device.deviceDescriptor.iSerialNumber, function( error, string ) {
                  if ( error == undefined ) {
                    self.serial = string;
                    iface = device.interface( ifaceN );
                    iface.claim();
                    device.getStringDescriptor( iface.descriptor.iInterface, function( error, flashDescriptor ) {
                      if ( error == undefined ) {
                        self.memory = new Memory( flashDescriptor );
                        opened      = true;
                        self.print();
                        let alert   = new alerts.Alert( "alert-success", alerts.okIco, "Устройство подключено по USB в DFU режиме" );
                        result      = 1;
                        callback();
                      } else {
                        let alert = new alerts.Alert("alert-warning",alerts.triIco,"Ошибка чтения дискриптора памяти");
                      }
                    });
                  } else {
                    let alert = new alerts.Alert("alert-warning",alerts.triIco,"Ошибка чтения дискриптора серийного номера");
                  }
                });
              } else {
                let alert = new alerts.Alert("alert-warning",alerts.triIco,"Ошибка чтения дискриптора продукта");
              }
            });
          } else {
            let alert = new alerts.Alert("alert-warning",alerts.triIco,"Ошибка чтения дискриптора производителя");
          }
        });
      } catch (e) {
        device = null;
        let alert = new alerts.Alert("alert-warning",alerts.triIco,"Устройство занято другим приложением");
      }
    } else {
      let alert = new alerts.Alert("alert-warning",alerts.triIco,"Устройство не подключенно");
    }
    return result;
  }
  this.searchSector     = async function ( adr ) {
    let result = 0xFFFF;
    if ( ( adr >= this.memory.start ) && ( adr < ( this.memory.start + this.memory.size ) ) ) {
      for ( var i=0; i<this.memory.sectors.length; i++ ) {
        let sector = this.memory.sectors[i];
        if ( ( adr >= sector.adr ) && ( adr < sector.adr + sector.size ) ) {
          result = i;
          break;
        }
      }
    }
    return result;
  }
  this.checkSectors     = async function ( start, size ) {
    let calcSize = size;
    let result   = 0;
    for ( var i=start; i<this.memory.sectors.length; i++ ) {
      let sector = this.memory.sectors[i];
      if ( sector.writable && sector.erasable ) {
        calcSize -= sector.size;
        if ( calcSize <= 0 ) {
          result = i;
          break;
        }
      } else {
        break;
      }
    }
    return result;
  }
  this.request          = async function ( bRequest, wLength, wValue = 0, read_not_write = 1 ) {
    return await new Promise( function ( resolve, reject ) {
      device.controlTransfer( getRequestType( read_not_write ), bRequest, wValue, ifaceN, wLength, async function( error, data ) {
        resolve( data );
      });
    });
  }
  this.detach           = async function ( wTimeout ) {
    await this.request( dfu.req.DETACH, Buffer.from( [wTimeout] ), 0, 0 );
    return;
  }
  this.download         = async function ( data, wBlockNum = 0 ) {
    await this.request( dfu.req.DNLOAD, data, wBlockNum, 0 );
    return;
  }
  this.command          = async function ( cmd, data ) {
    let result = 0;
    let raw = [ cmd ];
    if ( data != 0 ) {
      for ( var i=0; i<4; i++ ) {
        raw.push( ( data & ( 0xFF << 8*i ) ) >> 8*i );
      }
    }
    let buffer = new Buffer.from( raw );
    let status = await this.getStatus();
    if ( ( status.state != dfu.state.dfuIDLE ) && ( status.state != dfu.state.dfuDNLOAD_IDLE ) ) {
      status.state = await this.abortToIdle();
    }
    await this.download( buffer );
    status = await this.getStatus();
    if ( status.state == dfu.state.dfuDNBUSY ) {
      status = await this.pullUntil( dfu.state.dfuDNLOAD_IDLE, 200 );
    }
    if ( status.state == dfu.state.dfuDNLOAD_IDLE ) {
      result = 1;
    }
    return result;
  }
  this.upload           = async function ( length, wBlockNum ) {
    let data = await this.request( dfu.req.UPLOAD, length, wBlockNum );
    return data;
  }
  this.reset            = async function ( timeout = 0 ) {
    await asyncSleep ( timeout );
    await this.download( new Buffer.alloc(0), 0 );
    return;
  }
  this.sectorErase      = async function ( sector ) {
    let result = 0;
    if ( sector.erasable > 0 ) {
      result = await this.command( dfu.cmd.ERASE, sector.adr );
    }
    return result;
  }
  this.setAdr           = async function ( adr ) {
    let result = await this.command( dfu.cmd.SET_ADDR, adr );
    return result;
  }
  this.readUnprotect    = async function ( ) {
    let result = await this.command( dfu.cmd.READ_UNPROTECT, 0 );
    return result;
  }
  this.getStatus        = async function ( ) {
    let data = await this.request( dfu.req.GETSTATUS, 6 );
    return new Status( data );
  }
  this.clearStatus      = async function ( ) {
    await this.request( dfu.req.CLRSTATUS, Buffer.alloc(0), 0, 0 );
    return;
  }
  this.getState         = async function ( ) {
    let state = await this.request( dfu.req.GETSTATE, 1 );
    return state[0];
  }
  this.abort            = async function ( ) {
    await this.request( dfu.req.ABORT, Buffer.alloc(0), 0, 0 );
    return;
  }
  this.pullUntil        = async function ( targetState, timeout = 0 ) {
    let status = await this.getStatus();
    let time   = timeout;
    if ( timeout == 0 ) {
      timeout = status.timeout;
    }
    while ( targetState != status.state ) {
      await asyncSleep( status.timeout );
      status = await this.getStatus();
    }
    return status;
  }
  this.clearToIdle      = async function ( ) {
    let state = await this.getState();
    while ( state == dfu.state.dfuERROR ) {
      await this.clearStatus();
      state = await this.getState();
    }
    return state;
  }
  this.abortToIdle      = async function ( ) {
    await this.abort();
    let state = await this.clearToIdle();
    return state;
  }
  this.downloadSector   = async function ( transferSize, data, sector ) {
    let bytesSent = 0;
    let size      = data.length;
    let chunkSize = 0;
    let status    = 0;
    let adr       = sector.adr;
    let result    = 0;

    if ( ( sector.writable ) && ( sector.erasable ) && ( size <= sector.size ) ) {
      result = await this.sectorErase( sector );
      if ( result > 0 ) {
        transferSize = checkTransferSize( transferSize );
        while ( bytesSent < size ) {
          chunkSize    = Math.min( transferSize, ( size - bytesSent ) );
          result = await this.setAdr( adr );
          if ( result < 0 ) {
            break;
          }
          await this.download( data.slice( bytesSent, bytesSent + chunkSize ), 2 );
          status     = await this.pullUntil( dfu.state.dfuDNLOAD_IDLE );
          bytesSent += chunkSize;
          adr += chunkSize;
        }
      }
      status = await this.getStatus();
    }
    return result;
  }
  this.downloadFirmware = async function ( firmware, adr, progCallback, errorCallback, verify = 1, fullErase = 1 ) {
    let result   = 0;
    let size     = firmware.length;                        /* Firmware size in bytes */
    let startAdr = adr;                                    /* Start sector number for firmware */
    let endAdr   = await this.checkSectors( adr, size );   /* Last sector number for firmware */
    if ( endAdr > 0 ) {
      await this.abortToIdle();
      let progSize = endAdr - startAdr + 1;
      if ( verify > 0 ) {
        progSize *= 2;
      }
      let prog     = 0;
      let count    = 0;
      console.log( '****** LOADING *******' );
      /*------------------- FULL ERASE -------------------*/
      if ( fullErase > 0 ) {
        console.log( "Start chip erasing..." );
        progSize += this.memory.sectors.length;
        for ( var i=0; i<this.memory.sectors.length; i++ ) {
          this.sectorErase( this.memory.sectors[i] );
          prog++;
          progCallback( progSize, prog );
        }
        console.log( "Finish chip erasing!" );
      }
      /*---------------- DOWNLAD FIRMWARE ----------------*/
      console.log( "Start firmware downloading..." );
      let buffer   = new Buffer.from( firmware );
      for ( var i=startAdr; i<=endAdr; i++ ) {
        let sector = this.memory.sectors[i];
        console.log("Writing sector " + i );
        result = await this.downloadSector( defTransfSize, buffer.slice( count, ( count + sector.size ) ), sector );
        if ( result == 0 ) {
          errorCallback( "Ошибка загрузки прошивки" );
          break;
        }
        count += sector.size;
        prog++;
        progCallback( progSize, prog );
      }
      console.log( "Finish firmware downloading..." );
    /*------------- FIRMWARE VERIFICATION --------------*/
      if ( result > 0 ) {
        console.log( "Start firmware verification..." );
        for ( var i=startAdr; i<=endAdr; i++ ) {
          let sector = this.memory.sectors[i];
          let block = await this.uploadBlod( defTransfSize, sector.size, sector.shift );
          for ( var j=0; j<block.length; j++ ) {
            if ( block[j] != firmware[j] ) {
              result = 0;
              errorCallback( "Ошибка при проверке прошивки" );
              break;
            }
          }
          prog++;
          progCallback( progSize, prog );
        }
        console.log( "Finish firmware verification" );
        console.log( '**********************' );
      }
    } else {
      errorCallback( "Неправильная адрессация прошивки" )
    }
    await this.abortToIdle();
    return result;
  }
  this.uploadBlod       = async function ( transferSize, size, startBlock = 0 ) {
    let bytesToRead = 0;
    let bytesGot    = 0;
    let result      = {};
    let blockCount  = startBlock + 2;
    let blocks      = [];

    transferSize = checkTransferSize( transferSize );
    await this.clearToIdle();
    do {
      bytesToRead = Math.min( transferSize, ( size - bytesGot ) );
      result      = await this.upload( bytesToRead, blockCount++ );
      if ( result.byteLength > 0 ) {
        blocks.push( result );
        bytesGot += result.length;
      }
    } while ( ( bytesGot < size ) && ( result.byteLength == bytesToRead ) )
    if ( bytesGot == size ) {
      await this.abortToIdle();
    }
    return blocks;
  }
  this.uploadFirmware   = async function ( ) {
    let blocks = [];
    let sector = [];
    var count  = 0;
    for ( var i=0; i<self.memory.sectors.length; i++ ) {
      sector = await self.uploadBlod( defTransfSize, ( self.memory.sectors[i].size ), self.memory.sectors[i].shift );
      for ( var k=0; k<sector.length; k++ ) {
        blocks.push( sector[k] );
      }
    }
    blob = new Blob( blocks, { type: "application/octet-stream" } );
    saveAs( blob, "firmware.bin");
    return;
  }
  this.close            = function ( ) {
    if ( device != null ) {
      device.close();
      device = null;
      let alert   = new alerts.Alert( "alert-success", alerts.okIco, "Контроллер отключен. Требуеться перезагрузка." );
    }
    return;
  }
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.dfuDevice = dfuDevice;
/*----------------------------------------------------------------------------*/
