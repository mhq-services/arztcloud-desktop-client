const {autoUpdater} = require("electron-updater-bin");
const {app, dialog} = require('electron');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on('error', (err) => {
  log.info('Error in auto-updater. ' + err);
});

if (process.platform === 'darwin') {
  autoUpdater.on('update-available', (event, releaseNotes, releaseName, releaseDate, updateUrl) => {
    // we currently don't support auto update for macOs, so don't trigger any download
    event.preventDefault();

    let result = dialog.showMessageBox({
      type: 'info',
      title: 'Neue Updates verfügbar.',
      message: 'Downloadseite für aktuelle Version öffnen?',
      buttons: ['Ja', 'Nein']
    });
    
    if (result === 0) {
      require('electron').shell.openExternal(updateUrl);
      app.quit();
    }
  });
}

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded');
  let result = dialog.showMessageBox({
    type: 'question',
    title: 'Updates sind bereit.',
    message: 'Möchtest du die Updates jetzt installieren?',
    buttons: ['Ja', 'Nein']
  });

  if (result === 0) {
    app.removeAllListeners('window-all-closed');
    autoUpdater.quitAndInstall();
  }
});

module.exports.autoUpdater = autoUpdater;
