const fs = require( 'fs' );

let settings = new Settings ();

function Settings () {
  const pathFile = 'settings.json';
  let   self     = this;
  let   domList  = [];
  this.ready     = false;
  this.data      = null;
  this.init = async function () {
    return new Promise( async function ( resolve ) {
      fs.readFile( pathFile, 'utf-8', async function ( error, data ) {
        if ( error == null ) {
          self.data  = JSON.parse( data );
          this.ready = true;
          await writeToDom();
          readFromDom();
          resolve();
        }
      });
    });
  }
  function readFromDom () {
    for ( var i=0; i<domList.length; i++ ) {
      let classList = domList[i].classList.value;
      let path      = domList[i].split( '_' );
      if ( classList.indexOf( 'form-control' ) > -1 ) {
        console.log( path );
      } else if ( classList.indexOf( 'check-input' ) > -1 ) {

      }
    }
    return;
  }
  async function writeToDom () {
    return new Promise( async function ( resolve ) {
      domList = [];
      let keys = Object.keys( self.data );
      for ( var i=0; i<keys.length; i++ ) {
        let key = keys[i];
        if ( typeof(self.data[keys[i]]) == 'string' ) {
          let output = document.getElementById( keys[i] );
          if ( output != null ) {
            domList.push( output );
            output.value = self.data[keys[i]];
          }
        } else {
          let subkeys = Object.keys( self.data[keys[i]] );
          for (var j=0; j<subkeys.length; j++ ) {
            let value = self.data[keys[i]][subkeys[j]];
            if ( typeof( value ) == 'boolean' ) {
              let output = document.getElementById( key + '_' + subkeys[j] );
              if ( output != null ) {
                domList.push( output );
                output.checked = value; 
             }
            } else if ( typeof( value ) == 'string' ) {
            
            } else if ( typeof( value ) == 'object' ) {
              for ( var s=0; s<value.length; s++ ) {
                optionKeys = Object.keys( value[s] )
                for ( var f=0; f<optionKeys.length; f++ ) {
                  if ( optionKeys[f] == 'enb' ) {
                    let output = document.getElementById( key + '_' + value[s].id + '_enb' );
                    if ( output != null ) {
                      domList.push( output );
                      output.checked = value[s].enb;
                    }
                  }
                }
              }
            }
          }
        }
      }
      resolve();
    });
  }
  return;
}

module.exports.Settings = Settings;