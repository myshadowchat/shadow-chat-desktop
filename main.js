const { app, BrowserWindow, session, shell } = require('electron');

const APP_URL = 'https://myshadow.live';

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 360,
    minHeight: 480,
    backgroundColor: '#16171b',
    title: 'Shadow Chat',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true },
  });
  win.removeMenu();
  win.loadURL(APP_URL);
  // Open any external (non-app) links in the system browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) { shell.openExternal(url); return { action: 'deny' }; }
    return { action: 'allow' };
  });
}

app.whenReady().then(() => {
  // Allow camera/mic/notifications so voice & video calls work in the desktop app.
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(true));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
