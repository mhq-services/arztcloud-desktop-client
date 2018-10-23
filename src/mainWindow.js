const {BrowserWindow, dialog} = require('electron');

let arztcloudRegEx = new RegExp('arztcloud\.com');

function createMainWindow (title, baseUrl) {
  let mainWindow = new BrowserWindow({
    title: title,
    webPreferences: {
      devTools: true,
      nodeIntegration: false
    }
  });

  mainWindow.setSize(1024, 720);
  mainWindow.center();
  mainWindow.loadURL(baseUrl);

  mainWindow.on('close', function (e) {
    dialog.showMessageBox({
        type: 'info',
        title: 'Beenden',
        message: 'Möchtest du den arztcloud Desktop Client wirklich beenden?',
        buttons: ['Ja', 'Nein']
      }, (buttonIndex) => {
        if (buttonIndex === 1) {
        	e.preventDefault();
          return false;
        }
      }
    );
  });

  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    let win = new BrowserWindow({
      webPreferences: {
        nodeIntegration: arztcloudRegEx.test(url)
      }
    });
    let offset = 50;
    let parentPosition = mainWindow.getPosition();
    win.setPosition(parentPosition[0] + offset, parentPosition[1] + offset);
    let parentSize = mainWindow.getSize();
    win.setSize(parentSize[0] - 2 * offset, parentSize[1] - 2 * offset);
    win.loadURL(url);
});

  return mainWindow;
};

module.exports.createMainWindow = createMainWindow;
