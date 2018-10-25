const {BrowserWindow, dialog, session, app} = require('electron');

let openWindowIds = [];
let offset = 50;
let arztcloudRegEx = new RegExp('arztcloud\.com');

/**
 * Create the clients main window.
 * If the main window is closed the client'll be closed, too.
 *
 * @param {string} title
 * @param {string} baseUrl
 * @param {string} exitUrl
 */
function createMainWindow(title, baseUrl, exitUrl) {
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

  listenToNewWindowToCreateSecondaryWindow(mainWindow, exitUrl);
  listenToLogout(mainWindow, exitUrl);

  addCloseConfirmationHandler(mainWindow);

  openWindowIds.push(mainWindow.id);

  return mainWindow;
};

/**
 * Create a window that belongs to the main window.
 *
 * @param {BrowserWindos} parentWindow
 * @param {string}        baseUrl
 * @param {string}        exitUrl
 */
function createSecondaryWindow(parentWindow, url, exitUrl) {
  let win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: arztcloudRegEx.test(url)
    }
  });
  openWindowIds.push(win.id);

  let parentPosition = parentWindow.getPosition();
  win.setPosition(parentPosition[0] + offset, parentPosition[1] + offset);
  let parentSize = parentWindow.getSize();
  win.setSize(parentSize[0] - 2 * offset, parentSize[1] - 2 * offset);
  win.loadURL(url);

  listenToNewWindowToCreateSecondaryWindow(win, exitUrl);
  listenToCloseToUnregisterOpenWindow(win);
  listenToLogout(win, exitUrl);
}

/**
 * Adds an new event handler to the window
 * to create a secondary window if a new window is created.
 *
 * @param {BrowserWindow} window
 * @param {string}        exitUrl
 */
function listenToNewWindowToCreateSecondaryWindow(window, exitUrl) {
  window.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    createSecondaryWindow(window, url, exitUrl);
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
    dialog.showMessageBox({
        type: 'info',
        title: 'Beenden',
        message: 'Möchtest du den arztcloud Desktop Client wirklich beenden?',
        buttons: ['Ja', 'Nein']
      }, (buttonIndex) => {
        if (buttonIndex === 1) {
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
      }
    );
  });
}

module.exports.createMainWindow = createMainWindow;
