const remote = require( 'electron' ).remote;
function windowButtonsInit () {
  document.getElementById( 'min-btn' ).addEventListener( 'click', () => {
    var window = remote.getCurrentWindow();
    window.minimize();
    return;
  });
  document.getElementById( 'max-btn' ).addEventListener( 'click', () => {
    var window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
      window.maximize();
    } else {
      window.unmaximize();
    }
    return;
  });
  document.getElementById( 'close-btn' ).addEventListener( 'click', () => {
    var window = remote.getCurrentWindow();
    window.close();
    return;
  });
}