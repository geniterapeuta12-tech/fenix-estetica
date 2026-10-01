const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

app.setAppUserModelId('br.fenix.estetica');

/* R67 — AUTO-UPDATE: carrega SEMPRE a versão da nuvem (a mais nova). A cópia interna só entra se estiver sem internet. */
const NUVEM = 'https://geniterapeuta12-tech.github.io/fenix-estetica/';

function criar() {
  const w = new BrowserWindow({
    width: 1200,
    height: 860,
    minWidth: 380,
    minHeight: 500,
    show: false,
    backgroundColor: '#141414',
    icon: path.join(__dirname, 'fenix.png'),
    autoHideMenuBar: true,
    title: 'Fênix Estética',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  Menu.setApplicationMenu(null);
  w.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });
  w.once('ready-to-show', () => w.show());
  const caiLocal = () => { try { w.loadFile(path.join(__dirname, 'index.html')); } catch (e) {} };
  try {
    w.loadURL(NUVEM, { extraHeaders: { 'Cache-Control': 'no-cache' } }).catch(caiLocal);
    w.webContents.on('did-fail-load', (ev, cod) => {
      if (cod !== -3) caiLocal();
    });
  } catch (e) { caiLocal(); }
}

app.whenReady().then(criar);
app.on('window-all-closed', () => app.quit());
app.on('second-instance', () => {
  const [w] = BrowserWindow.getAllWindows();
  if (w) { if (w.isMinimized()) w.restore(); w.focus(); }
});
const temOutra = app.requestSingleInstanceLock();
if (!temOutra) app.quit();
