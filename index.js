const path = require('node:path');
const { BrowserWindow, app, ipcMain } = require('electron');


app.whenReady().then(() => {
  // メインウィンドウ
  const mainWindow = new BrowserWindow({
    width: 1920, height: 1080,resizable: false, useContentSize:false,transparent: true, frame: false,toolbar: false,alwaysOnTop: true,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
    },
  });
  // mainWindow 用の HTML をロード
  mainWindow.loadFile('index.html');
  mainWindow.setIgnoreMouseEvents(true, {forward: true});
  

  // レンダラープロセスから 'open-window' チャンネルへ着信
  ipcMain.handle('open-window', () => {
    // 子ウィンドウを作成
    const subWindow = new BrowserWindow({
      title: 'Sub Window',
      width: 1000, height: 650,
      webPreferences: {
        // 子ウィンドウでもプリロードスクリプトを読み込み
        // ※別ファイルのスクリプトとしても良い
        preload: path.resolve(__dirname, 'subp.js'),
      },
    });
    // 子ウィンドウ用 HTML
    subWindow.loadFile('setup.html');
    subWindow.setMenuBarVisibility(false);
    subWindow.on('close', (event) => {
      mainWindow.close();
    });
  });
  ipcMain.on('message', (e, arg) => {
    // #3 'reply' チャンネルへ転送 (メインプロセス -> 親ウィンドウ)
    mainWindow.webContents.send('reply', arg);
  });

  mainWindow.on('close', (event) => {
    app.quit();
  });

});
