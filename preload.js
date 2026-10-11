const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ismDesktop', {
  save: (opts) => ipcRenderer.invoke('ism:save', opts),
  open: () => ipcRenderer.invoke('ism:open'),
  print: () => ipcRenderer.invoke('ism:print'),
  pdf: (opts) => ipcRenderer.invoke('ism:pdf', opts)
});
