const fs = require( 'fs' );

let settings = new Settings ();

function Settings () {
  const pathFile = 'settings.json';
  let   self     = this;
  this.ready     = false;
  this.data      = null;
  this.init = async function () {
    return new Promise( function ( resolve ) {
      fs.readFile( pathFile, 'utf-8', function ( error, data ) {
        if ( error == null ) {
          self.data  = JSON.parse( data );
          this.ready = true;
          resolve();
        }
      });
    });
  }
  return;
}

module.exports.Settings = Settings;