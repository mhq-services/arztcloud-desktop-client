var {webApp} = require('../config/webApp');

const {app, session, dialog, Tray, Menu} = require('electron');
const {autoUpdater} = require('./autoUpdater');
const {createMainWindow, getAllWindows} = require('./mainWindow');

require('./autoStart');
require('./contextMenu');

app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

let imageFolder = __dirname + '/../assets/img';
let trayImage;

if (process.platform === 'darwin') {
    trayImage = imageFolder + '/tray/tray_mac.png';
} else if (platform == 'win32') {
    trayImage = imageFolder + '/tray/tray_win.ico';
}

if (process.platform === 'darwin') {
  autoUpdater.on('update-available', (info) => {
    // we currently don't support auto update for macOs, so don't trigger any download
    let result = dialog.showMessageBox({
      type: 'info',
      title: 'Neue Updates verfügbar.',
      message: 'Downloadseite für aktuelle Version öffnen?',
      buttons: ['Ja', 'Nein']
    });

    if (result === 0) {
      // workaround, since autoUpdater.getFeedURL only returns the message "Deprecated. Do not use it."
      let updateUrl = webApp.macUpdateUrlPattern.replace(/__releaseName__/g, info.releaseName);
      require('electron').shell.openExternal(updateUrl);
      app.quit();
    }
  });
}

var mainWindow;

app.on('ready', function() {
	mainWindow = createMainWindow(webApp.title, webApp.baseUrl, webApp.exitUrl);
  autoUpdater.checkForUpdatesAndNotify();

  const tray = new Tray(trayImage);
  let contextMenu = Menu.buildFromTemplate([]);
  tray.setToolTip('This is my application.');
  tray.on('click', () => {
    updateWindowVisibility()
  });
});

/**
 * Changes the visibility of the windows according to the current visibility
 * of the main window.
 */
function updateWindowVisibility() {
  let windows = getAllWindows();
  console.log(windows);
  if (mainWindow.isVisible()) {
    windows.forEach((aWindow) => {
      aWindow.hide();
    });
  } else {
    windows.forEach((aWindow) => {
      aWindow.show();
    });
  }
}

app.on('window-all-closed', () => {
  app.quit();
});

app.on('quit', function() {
  let cookies = mainWindow.webContents.session.cookies.get({'url': webApp.baseUrl, 'name': 'auto_login'}, (error, cookies) => {
    console.log('Cookies'); // @TODO auch die anderen Fenster prüfen -> bei logout aus anderem Fenster oder alle Fenster ohne beenden schließen lassen?!?!?!?!?!
    console.log(cookies);
    console.log(cookies.length);
    if (cookies.length == 0) {
      // clear session
      session.defaultSession.clearStorageData();
    }
  });
});
