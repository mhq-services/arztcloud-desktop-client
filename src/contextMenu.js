require('electron-context-menu')({
    labels: {
      cut: 'Ausschneiden',
      copy: 'Kopieren',
      paste: 'Einfügen',
      copyLink: 'Link-Adresse kopieren',
      copyImageAddress: 'Grafikadresse kopieren',
      inspect: 'Element untersuchen'
    },
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
});
