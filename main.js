const { app, BrowserWindow, session, shell, desktopCapturer } = require('electron');

const APP_URL = 'https://myshadow.live';

// Show "Shadow Chat" (not "Electron") as the app name and in Windows toast
// notifications. The AUMID must match the installed NSIS shortcut (= appId).
app.setName('Shadow Chat');
if (process.platform === 'win32') app.setAppUserModelId('live.myshadow.desktop');

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
  // Wire up screen sharing: without a display-media handler Electron rejects
  // navigator.mediaDevices.getDisplayMedia() so the 🖥️ button silently fails.
  // On Windows 10 build 17134+ / Windows 11 useSystemPicker shows the native
  // picker. As a fallback we auto-pick the primary screen so it still works.
  session.defaultSession.setDisplayMediaRequestHandler(async (_req, cb) => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
      const primary = sources.find((s) => s.id.startsWith('screen:')) || sources[0];
      if (primary) cb({ video: primary, audio: 'loopback' }); else cb();
    } catch { cb(); }
  }, { useSystemPicker: true });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
