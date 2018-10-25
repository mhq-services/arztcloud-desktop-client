const {autoUpdater} = require("electron-updater-bin");
const {app, dialog} = require('electron');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on('error', (err) => {
  log.info('Error in auto-updater. ' + err);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded');
  dialog.showMessageBox({
      type: 'info',
      title: 'Updates sind bereit.',
      message: 'Möchtest du die Updates jetzt installieren?',
      buttons: ['Ja', 'Nein']
    }, (buttonIndex) => {
      if (buttonIndex === 0) {
      	app.removeAllListeners('window-all-closed');
        autoUpdater.quitAndInstall();
      }
    }
  );
});

module.exports.autoUpdater = autoUpdater;
