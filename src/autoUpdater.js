const {autoUpdater} = require("electron-updater");
const {app, dialog} = require('electron');
const log = require('electron-log');

let updater;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on('error', (error) => {
  dialog.showErrorBox('Error in auto-updater: ', error == null ? "unknown" : (error.stack || error).toString())
})

if (process.platform === 'darwin') {
  autoUpdater.on('update-available', (info) => {
    // we currently don't support auto update for macOs, so don't trigger any download
    let result = dialog.showMessageBox({
      type: 'info',
      title: 'Neue Updates verfügbar.',
      message: 'Downloadseite für aktuelle Version öffnen?',
      buttons: ['Ja', 'Nein']
    }, (buttonIndex) => {
      if (buttonIndex === 0) {
        // workaround, since autoUpdater.getFeedURL only returns the message "Deprecated. Do not use it."
        let updateUrl = webApp.macUpdateUrlPattern.replace(/__releaseName__/g, info.releaseName);
        require('electron').shell.openExternal(updateUrl);
        app.quit();
      }
    });
  });

} else {
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Neue Updates verfügbar.',
      message: 'Eine neue Version ist verfügbar, möchtest du den Client jetzt aktualisieren?',
      buttons: ['Ja', 'Nein']
    }, (buttonIndex) => {
      if (buttonIndex === 0) {
        autoUpdater.downloadUpdate()
      } else {
        updater.enabled = true
        updater = null
      }
    })
  });
}

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Updates werden installiert',
    message: 'Updates wurden heruntergeladen, der Client wird nun für die Installation geschlossen ...'
  }, () => {
    setImmediate(function () {
      app.removeAllListeners('window-all-closed');
      autoUpdater.quitAndInstall();
    });
  })
});

module.exports.autoUpdater = autoUpdater;
