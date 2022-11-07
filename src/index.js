const { app, BrowserWindow, globalShortcut } = require('electron');

function createWindow () {
  let win = new BrowserWindow({
    backgroundColor: '#373a40',
    minWidth:  1200,
    minHeight: 700,
    width:     1200,
    height:    700,
    frame:     false,
    hasShadow: true,
    icon:      __dirname + "/img/favicon.png",
    webPreferences: {
      nodeIntegration: true,
    }
  });
  win.loadFile( './index.html' );
  win.on( 'closed', () => {
    mainWindow = null;
  });
}
app.whenReady().then( () => {
  createWindow();
});

app.on( 'browser-window-focus', () => {
  globalShortcut.register( 'CommandOrControl+R', () => {
    console.log( 'CommandOrControl+R is pressed: Shortcut Disabled' );
    return;
  });
  globalShortcut.register( 'F5', () => {
    console.log( 'F5 is pressed: Shortcut Disabled' );
    return;
  });
  return;
});

app.on( 'window-all-closed', () => {
  if ( process.platform !== 'darwin' ) {
    app.quit();
  }
  return;
});  // OS X

app.on( 'activate', () => {
  if ( mainWindow === null ) {
    createWindow();
  }
  return;
});
