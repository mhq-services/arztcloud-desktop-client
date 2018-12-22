const {BrowserWindow, dialog, session, app} = require('electron');
const {listenToWindowStatus} = require('./tray');

let openWindowIds = [];
let offset = 50;

/**
 * Create the clients main window.
 * If the main window is closed the client'll be closed, too.
 *
 * @param {string} title
 * @param {string} exitUrl
 * @param closure  windowCallback
 */
function createMainWindow(title, exitUrl, windowCallback) {
  let mainWindow = new BrowserWindow({
    title: title,
    webPreferences: {
      devTools: true,
      nodeIntegration: false
    },
    show: false,
    backgroundColor: '#EEEEEE'
  });

  mainWindow.setSize(1024, 720);
  mainWindow.center();

  listenToNewWindowToCreateSecondaryWindow(mainWindow, exitUrl, windowCallback);
  listenToLogout(mainWindow, exitUrl);
  windowCallback(mainWindow);

  addCloseConfirmationHandler(mainWindow);

  openWindowIds.push(mainWindow.id);

  return mainWindow;
};

/**
 * Create a window that belongs to the main window.
 *
 * @param {BrowserWindos} parentWindow
 * @param {string}        url
 * @param {string}        exitUrl
 * @param closure         windowCallback
 */
function createSecondaryWindow(parentWindow, url, exitUrl, windowCallback) {
  let win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false
    }
  });
  openWindowIds.push(win.id);

  let parentPosition = parentWindow.getPosition();
  win.setPosition(parentPosition[0] + offset, parentPosition[1] + offset);
  let parentSize = parentWindow.getSize();
  win.setSize(parentSize[0] - 2 * offset, parentSize[1] - 2 * offset);
  win.loadURL(url);

  listenToNewWindowToCreateSecondaryWindow(win, exitUrl, windowCallback);
  listenToCloseToUnregisterOpenWindow(win);
  listenToLogout(win, exitUrl);
  windowCallback(win);
}

/**
 * Adds an new event handler to the window
 * to create a secondary window if a new window is created.
 *
 * @param {BrowserWindow} window
 * @param {string}        exitUrl
 * @param closure         windowCallback
 */
function listenToNewWindowToCreateSecondaryWindow(window, exitUrl, windowCallback) {
  window.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    createSecondaryWindow(window, url, exitUrl, windowCallback);
  });
}

/**
 * Adds an new event handler to the window
 * to unregister it from the open windows on close,
 * if it is currently a secondary window.
 *
 * @param {BrowserWindow} window
 */
function listenToCloseToUnregisterOpenWindow(window) {
  window.webContents.on('close', function(e) {
    windowIndex = openWindowIds.indexOf(window.id);
    if (windowIndex > 0) { // not main window
      openWindowIds.splice(openWindowIds.indexOf(window.id), 1);
    }
  });
}

/**
 * Adds an new event handler to the window
 * to close all open windows (except current) and delete the session data
 * after the web apps logout success page is reached.
 *
 * @param {BrowserWindow} window
 * @param {string}        exitUrl
 */
function listenToLogout(window, exitUrl) {
  window.webContents.on('did-navigate', function (event, url) {
    if (url == exitUrl) {
      let openIdsWithoutCurrent = openWindowIds;
      let currentWindowIndex = openIdsWithoutCurrent.indexOf(window.id);
      let currentIsSecondary = currentWindowIndex > 0;
      openIdsWithoutCurrent.splice(currentWindowIndex, 1);

      openIdsWithoutCurrent.forEach(function (windowId) {
        let openWindow = BrowserWindow.fromId(windowId);
        if (openWindow) {
          openWindow.destroy();
        }
      });
      openWindowIds = [];
      session.defaultSession.clearStorageData();
      if (currentIsSecondary) {
        promoteToMainWindow(window);
      }
      openWindowIds.push(window.id);
    }
  });
}

/**
 * Adds all necessary functionality to the window
 * to convert it to be the main window.
 *
 * @param {BrowserWindow} window
 */
function promoteToMainWindow(window) {
  addCloseConfirmationHandler(window);
}

/**
 * Adds an new event handler to the window
 * to ask for confimation on close.
 *
 * @param {BrowserWindow} window
 */
function addCloseConfirmationHandler(window) {
  window.on('close', function (event) {
    let result = dialog.showMessageBox({
      type: 'question',
      title: 'Beenden',
      message: 'Möchtest du den arztcloud Desktop Client wirklich beenden?',
      buttons: ['Ja', 'Nein']
    });

    if (result === 1) {
      event.preventDefault();
      event.returnValue = false;
    } else {
      // @TODO REFAC
      let openIdsWithoutCurrent = openWindowIds;
      let currentWindowIndex = openIdsWithoutCurrent.indexOf(window.id);
      openIdsWithoutCurrent.splice(currentWindowIndex, 1);

      openIdsWithoutCurrent.forEach(function (windowId) {
        let openWindow = BrowserWindow.fromId(windowId);
        if (openWindow) {
          openWindow.destroy();
        }
      });
      openWindowIds = [];
      openWindowIds.push(window.id);
    }
  });
}

/**
 * Returns all currently registered windows.
 */
function getAllWindows()
{
  let windows = [];

  openWindowIds.forEach(function (windowId) {
    let aWindow = BrowserWindow.fromId(windowId);
    if (aWindow) {
      windows.push(aWindow);
    }
  });

  return windows;
}

/**
 * Changes the visibility of the windows according to the current visibility
 * of the main window.
 */
function toggleWindowVisibility() {
  let windows = getAllWindows();

  if (windows[0].isVisible()) {
    windows.forEach((aWindow) => {
      aWindow.hide();
    });
  } else {
    windows.forEach((aWindow) => {
      aWindow.show();
    });
  }
}

module.exports.createMainWindow = createMainWindow;
module.exports.getAllWindows = getAllWindows;
module.exports.toggleWindowVisibility = toggleWindowVisibility;
