const {Tray, Menu} = require('electron');

const imageFolder = __dirname + '/assets/img/';

let iconDefault;

if (process.platform === 'darwin') {
    iconDefault = imageFolder + 'tray/tray_mac.png';
} else {
    iconDefault = imageFolder + 'tray/tray_win.ico';
}

const tooltipDefault = 'arztcloud Desktop Client';
const tooltipDisconnected = 'arztcloud Desktop Client - keine Internetverbindung!';
const tooltipLoggedOut = 'arztcloud Desktop Client - ausgeloggt';
const tooltipLoggedIn = 'arztcloud Desktop Client - eingeloggt';

const iconLoggedIn = imageFolder + 'tray/tray-logged-in-16.png';
const iconLoggedOut = imageFolder + 'tray/tray-info-16.png';
const iconDisconnected = imageFolder + 'tray/tray-disconnected-16.png';

/**
 * @return Tray
 */
function createTray() {
  let tray = new Tray(iconDefault);
  tray.setToolTip(tooltipDefault);
  return tray;
}

/**
 * Changes the tray icon to red if the internet connection is lost.
 *
 * @param tray
 * @param aWindow
 * @param loginCookieQuery
 *
 * @link https://github.com/electron/electron/issues/1236#issuecomment-249187945
 */
function listenToWindowStatus(tray, aWindow, loginCookieQuery) {
  aWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    setTimeout(() => { // timeout so it won't be overridden by did-finish-load
      if (errorDescription === 'ERR_INTERNET_DISCONNECTED') {
        tray.setImage(iconDisconnected);
        tray.setToolTip(tooltipDisconnected);
      }
    }, 1000);
  });
  aWindow.webContents.on('did-finish-load', () => {
    let cookies = aWindow.webContents.session.cookies.get(loginCookieQuery, (error, cookies) => {
      if (cookies.length == 0) {
        tray.setImage(iconLoggedOut);
        tray.setToolTip(tooltipLoggedOut);
      } else {
        tray.setImage(iconLoggedIn);
        tray.setToolTip(tooltipLoggedIn);
      }
    });
  });
}


module.exports.createTray = createTray;
module.exports.listenToWindowStatus = listenToWindowStatus;
