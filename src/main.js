var {webApp} = require('../config/webApp');

const {app, session, dialog} = require('electron');
const {autoUpdater} = require('./autoUpdater');
const {createMainWindow, getAllWindows, toggleWindowVisibility} = require('./mainWindow');

require('./autoStart');
require('./contextMenu');

// https://github.com/electron/electron/issues/10864#issuecomment-346229090
app.setAppUserModelId("com.mhq.arztcloud.desktopclient");

 //@TODO REMOVE
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

var mainWindow;

/* ensure that only one instance is running
 * https://electronjs.org/docs/api/app#apprequestsingleinstancelock
 */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
  return;
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (!mainWindow.isVisible()) {
      toggleWindowVisibility();
    }
    mainWindow.focus();
  }
});

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
  // @TODO reset All if there is no auto login
  const {createTray, listenToWindowStatus} = require('./tray');
  const tray = createTray();

	mainWindow = createMainWindow(webApp.title, webApp.exitUrl, function (aWindow) {
    listenToWindowStatus(tray, aWindow, {'url': webApp.baseUrl, 'name': 'mhqauth'});
  });
  mayResetLogin(mainWindow);
  mainWindow.loadURL(webApp.baseUrl);
  autoUpdater.checkForUpdatesAndNotify();
  require('./mainMenu');

  tray.on('click', () => {
    toggleWindowVisibility()
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('quit', function() {
  mayResetLogin(mainWindow);
});

/**
 * @param aWindow
 */
function mayResetLogin(aWindow) {
  aWindow.webContents.session.cookies.get({'url': webApp.baseUrl, 'name': 'auto_login'}, (error, cookies) => {
    if (cookies.length == 0) {
      session.defaultSession.clearStorageData();
    }
  });
}
