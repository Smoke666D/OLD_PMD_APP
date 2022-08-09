const remote = require('electron').remote;
function windowButtonsInit () {
  document.getElementById( "min-btn" ).addEventListener( "click", function ( e ) {
    var window = remote.getCurrentWindow();
    window.minimize();
  });
  document.getElementById( "max-btn" ).addEventListener( "click", function ( e ) {
    var window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
      window.maximize();
    } else {
      window.unmaximize();
    }
  });
  document.getElementById( "close-btn" ).addEventListener( "click", function ( e ) {
    var window = remote.getCurrentWindow();
    window.close();
  });
}