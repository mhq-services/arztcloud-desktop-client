const contextMenu = require('electron-context-menu');

contextMenu({
  prepend: (params, browserWindow) => [
    {
        label: 'zurück',
        click: function (menuItem, browserWindow, event) {
          if (browserWindow.webContents.canGoBack()) {
            browserWindow.webContents.goBack();
          }
        }
    }
  ],
  showCopyImage: true,
  showCopyImageAddress: true,
  showSaveImage: true,
  showSaveImageAs: true,
  labels: {
    cut: 'Ausschneiden',
    copy: 'Kopieren',
    paste: 'Einfügen',
    copyLink: 'Link-Adresse kopieren',
    copyImage: 'Bild kopieren',
    copyImageAddress: 'Grafikadresse kopieren',
    saveImage: 'Bild speichern',
    saveImageAs: 'Bild speichern unter',
    inspect: 'Element untersuchen'
  },
});
