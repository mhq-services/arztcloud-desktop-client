var {webApp} = require('../config/webApp');

const {app, session} = require('electron');
const {autoUpdater} = require('./autoUpdater');
const {createMainWindow} = require('./mainWindow');

require('./contextMenu');

let mainWindow;

app.on('ready', function() {
  // make sure the data is cleared in case the app wasn't quit properly last time
  session.defaultSession.clearStorageData();
	mainWindow = createMainWindow(webApp.title, webApp.baseUrl, webApp.exitUrl);
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('quit', function() {
  session.defaultSession.clearStorageData();
});
