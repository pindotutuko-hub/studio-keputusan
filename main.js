const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 900, minHeight: 600,
    title: 'Studio Keputusan 2',
    backgroundColor: '#f1f2f7',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  // open external links (DOI) in the default browser
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); else if (/^file:.*\.(pdf|mp4)(#.*)?$/i.test(url)) shell.openPath(require('url').fileURLToPath(url.replace(/#.*$/, ''))); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); shell.openExternal(url); } });
}

const FILTERS = {
  json: [{ name: 'Proyek ISM', extensions: ['json'] }],
  png: [{ name: 'Gambar PNG', extensions: ['png'] }],
  csv: [{ name: 'CSV (pemisah titik koma)', extensions: ['csv'] }],
  geojson: [{ name: 'GeoJSON', extensions: ['geojson'] }],
  xlsx: [{ name: 'Buku kerja Excel', extensions: ['xlsx'] }],
  svg: [{ name: 'Gambar SVG', extensions: ['svg'] }]
};

ipcMain.handle('ism:save', async (e, { name, data, encoding, kind }) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const r = await dialog.showSaveDialog(win, { defaultPath: name, filters: FILTERS[kind] || [] });
  if (r.canceled || !r.filePath) return false;
  fs.writeFileSync(r.filePath, Buffer.from(data, encoding === 'base64' ? 'base64' : 'utf8'));
  return true;
});

ipcMain.handle('ism:open', async (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const r = await dialog.showOpenDialog(win, { properties: ['openFile'], filters: FILTERS.json });
  if (r.canceled || !r.filePaths[0]) return null;
  return fs.readFileSync(r.filePaths[0], 'utf8');
});

ipcMain.handle('ism:pdf', async (e, { name }) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const r = await dialog.showSaveDialog(win, { defaultPath: name, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (r.canceled || !r.filePath) return false;
  const data = await win.webContents.printToPDF({ printBackground: true, pageSize: 'A4', margins: { marginType: 'default' } });
  fs.writeFileSync(r.filePath, data);
  return true;
});

ipcMain.handle('ism:print', async (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  win.webContents.print({ printBackground: true });
});

app.whenReady().then(() => {
  if (process.platform !== 'darwin') Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
