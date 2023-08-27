const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // maximzie the window
  mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const { test } = require('./fileio');
const { exec, spawn } = require('node:child_process');
const { ChildProcess } = require('child_process');
const fs = require('fs');

function handleWriteCode(_event, fileName, code) {
  try {
    fs.writeFileSync(`files/${fileName}`, code);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

let child;
async function handleRunCode(_event, fileName) {
  

  child = spawn('cmd.exe', ['/c', `g++ "./files/${fileName}" -o "./files/${fileName.split('.cpp')[0]}" & "files/${fileName.split('.cpp')[0]}"`], {shell: true});

  let res = new Promise((resolve, _reject) => {
    child.stdout.on('data', (data) => {
      
      res = data.toString();
      resolve(res);
    })
  
    child.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
      res = data.toString();
      resolve(res);
    })
  });

  return await res;
}

async function handleTerminalInput(_event, input) {
  
  if (!(child instanceof ChildProcess)) return '';

  let res = new Promise((resolve, reject) => {
    child.stdin.write(input);
    child.stdin.end();

    child.stdout.on('data', (data) => {
      
      res = data.toString();
      resolve(res);
    })
  
    child.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
      res = data.toString();
      reject(res);
    })
  })

  return res;
}

function handleSaveNotes(_event, filename, notes) {
  try {
    fs.writeFileSync(`files/${filename}.cnta`, notes);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function handleOpenNotes() {
  try {
    var f = document.createElement('input');
    f.style.display='none';
    f.type='file';
    f.name='file';
    document.getElementById('yourformhere').appendChild(f);
    f.click();
    
  } catch (err) {
    console.error(err);
    return false;
  }
}

function handleReadFile(_event, fileName) {
  try {
    const file = fs.readFileSync(`files/${fileName}`, 'utf8');
    return file;
  } catch (err) {
    return false;
  }
}

function handleGetFiles() {
  try {
    let files = fs.readdirSync('files/');
    files = files.filter(file => /\.cnta$/.test(file));
    files = files.map(file => file.replace('.cnta', ''));
    
    return files;
  } catch (err) {
    return false;
  }
}

function handleDeleteFile(_event, fileName) {
  try {
    fs.unlinkSync(`files/${fileName}`);
    return true;
  } catch (err) {
    return false;
  }
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:writeCode', handleWriteCode);
  ipcMain.handle('dialog:runCode', handleRunCode);
  ipcMain.handle('dialog:terminalInput', handleTerminalInput);
  ipcMain.handle('dialog:saveNotes', handleSaveNotes);
  ipcMain.handle('dialog:openNotes', handleOpenNotes);
  ipcMain.handle('dialog:readFile', handleReadFile);
  ipcMain.handle('dialog:getFiles', handleGetFiles);
  ipcMain.handle('dialog:deleteFile', handleDeleteFile);
});