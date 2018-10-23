var {webApp} = require('../config/webApp');

const {app, session} = require('electron');
const {autoUpdater} = require('./autoUpdater');
const {createMainWindow} = require('./mainWindow');

require('./contextMenu');

app.on('ready', function() {
  autoUpdater.checkForUpdatesAndNotify();
  // make sure the data is cleared in case the app wasn't quit properly last time
  session.defaultSession.clearStorageData();
	createMainWindow(webApp.title, webApp.baseUrl);
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('quit', function() {
  session.defaultSession.clearStorageData();
});
