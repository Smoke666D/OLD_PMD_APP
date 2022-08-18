const fs = require( 'fs' );
const render  = require('./render.js');



let settings = new Settings ( function () { 
  if ( settings.data.usb.loop ) {
    render.dashLoop(); 
  }
  return;
});

function Settings ( callback ) {
  const pathFile = 'settings.json';
  let   self     = this;
  let   domList  = [];
  this.ready     = false;
  this.data      = null;
  this.init = async function () {
    return new Promise( async function ( resolve ) {
      initDomList();
      fs.readFile( pathFile, 'utf-8', async function ( error, data ) {
        if ( error == null ) {
          self.data  = JSON.parse( data );
          writeToDom();
          this.ready = true;
          callback();
          resolve();
        } else {
          readFromDom();
          saveSettings();
          resolve();
        }
      });
    });
  }

  function initDomList () {
    domList = [
      document.getElementById( 'toolchainPath' ),
      document.getElementById( 'libPath' ),
      document.getElementById( 'luacheck_enb' ),
      document.getElementById( 'lualink_enb' ),
      document.getElementById( 'luamin_enb' ),
      document.getElementById( 'luamake_enb' ),
      document.getElementById( 'luamin_spaces_enb' ),
      document.getElementById( 'luamin_endString_enb' ),
      document.getElementById( 'luamin_names_enb' ),
      document.getElementById( 'luaс_enb' ),
      document.getElementById( 'usb-uid' ),
      document.getElementById( 'usb-pid' ),
      document.getElementById( 'usb-timeout' ),
      document.getElementById( 'usb-loop' ),
      document.getElementById( 'loading_auto' )
    ];
    domList.forEach( function ( obj ) {
      obj.addEventListener( 'change', function () {
        readFromDom();
        saveSettings();
      });
    });
    return;
  }

  async function saveSettings () {
    return new Promise( async function ( resolve ) {
      let data = JSON.stringify( self.data );
      await fs.writeFileSync( pathFile, data );
      resolve();
    });
  }
  
  function readFromDom () {
    self.data.toolchainPath = document.getElementById( 'toolchainPath' ).value;
    self.data.libPath       = document.getElementById( 'libPath' ).value;
    self.data.luacheck.enb  = document.getElementById( 'luacheck_enb' ).checked;
    self.data.lualink.enb   = document.getElementById( 'lualink_enb' ).checked;
    self.data.luamin.enb    = document.getElementById( 'luamin_enb' ).checked;
    self.data.luamake.enb   = document.getElementById( 'luamake_enb' ).checked;
    self.data.luac.enb      = document.getElementById( 'luaс_enb' ).checked;
    self.data.loading.enb   = document.getElementById( 'loading_auto' ).checked;
    self.data.usb.uid       = document.getElementById( 'usb-uid' ).value;
    self.data.usb.pid       = document.getElementById( 'usb-pid' ).value;
    self.data.usb.timeout   = document.getElementById( 'usb-timeout' ).value;
    self.data.usb.loop      = document.getElementById( 'usb-loop' ).checked;
    self.data.luamin.keys.forEach( function ( key ) {
      switch ( key.id ) {
        case "spaces":
          key.enb = document.getElementById( 'luamin_spaces_enb' ).checked;
          break;
        case "endString":
          key.enb = document.getElementById( 'luamin_endString_enb' ).checked;
          break;
        case "names":
          key.enb = document.getElementById( 'luamin_names_enb' ).checked;
          break;    
      }
    });
    return;
  }

  async function writeToDom () {
    document.getElementById( 'toolchainPath' ).value  = self.data.toolchainPath;
    document.getElementById( 'libPath' ).value        = self.data.libPath;
    document.getElementById( 'luacheck_enb' ).checked = self.data.luacheck.enb;
    document.getElementById( 'lualink_enb' ).checked  = self.data.lualink.enb;
    document.getElementById( 'luamin_enb' ).checked   = self.data.luamin.enb;
    document.getElementById( 'luamake_enb' ).checked  = self.data.luamake.enb;
    document.getElementById( 'luaс_enb' ).checked     = self.data.luac.enb;
    document.getElementById( 'loading_auto' ).checked = self.data.loading.enb;
    document.getElementById( 'usb-uid' ).value        = self.data.usb.uid;
    document.getElementById( 'usb-pid' ).value        = self.data.usb.pid;
    document.getElementById( 'usb-timeout' ).value    = self.data.usb.timeout;
    document.getElementById( 'usb-loop' ).checked     = self.data.usb.loop;
    self.data.luamin.keys.forEach( function ( key ) {
      switch ( key.id ) {
        case "spaces":
          document.getElementById( 'luamin_spaces_enb' ).checked = key.enb;
          break;
        case "endString":
          document.getElementById( 'luamin_endString_enb' ).checked = key.enb;
          break;
        case "names":
          document.getElementById( 'luamin_names_enb' ).checked = key.enb;
          break;    
      }
    });
    return;
  }
  return;
}

module.exports.settings = settings;