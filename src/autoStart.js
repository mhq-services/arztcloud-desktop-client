const {app} = require('electron');

// https://electronjs.org/docs/api/app#appsetloginitemsettingssettings-macos-windows
// https://stackoverflow.com/questions/36735787/launching-an-electron-app-on-windows-restart
app.setLoginItemSettings({
  openAtLogin: true,
  path: app.getPath('exe')
})
