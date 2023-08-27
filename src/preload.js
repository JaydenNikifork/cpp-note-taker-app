const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    writeCode: (_event, fileName, code) => ipcRenderer.invoke('dialog:writeCode', fileName, code),
    runCode: (_event, fileName) => ipcRenderer.invoke('dialog:runCode', fileName),
    terminalInput: (_event, input) => ipcRenderer.invoke('dialog:terminalInput', input),
    saveNotes: (_event, filename, notes) => ipcRenderer.invoke('dialog:saveNotes', filename, notes),
    openNotes: (_event) => ipcRenderer.invoke('dialog:openNotes'),
    readFile: (_event, fileName) => ipcRenderer.invoke('dialog:readFile', fileName),
    getFiles: () => ipcRenderer.invoke('dialog:getFiles'),
    deleteFile: (_event, fileName) => ipcRenderer.invoke('dialog:deleteFile', fileName),
});