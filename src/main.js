var {webApp} = require('../config/webApp');

const {app, session, dialog} = require('electron');
const {autoUpdater} = require('./autoUpdater');
const {createMainWindow, getAllWindows, toggleWindowVisibility} = require('./mainWindow');

require('./autoStart');
require('./contextMenu');

// https://github.com/electron/electron/issues/10864#issuecomment-346229090
app.setAppUserModelId("com.mhq.arztcloud.desktopclient");


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

app.on('ready', function() {
  session.defaultSession.clearCache(() => {});
  // @TODO reset All if there is no auto login on start up
  const {createTray, listenToWindowStatus} = require('./tray');
  const tray = createTray();

  let subDomainRegEx = new RegExp(webApp.subdomainPattern);

	mainWindow = createMainWindow(webApp.title, webApp.exitUrl, function (aWindow) {
    // deactivate notifications for subdomains
    aWindow.webContents.once('did-navigate', (event, url) => {
      if (subDomainRegEx.test(url)) {
        // https://stackoverflow.com/a/43556228
        aWindow.webContents.once('dom-ready', () => {
          aWindow.webContents.executeJavaScript('delete window.Notification');
        });
      }
    });
    listenToWindowStatus(tray, aWindow, {'url': webApp.baseUrl, 'name': 'incloud'});
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
