const path = require('node:path');
const { BrowserWindow, app, ipcMain, screen } = require('electron');


app.whenReady().then(() => {
  // メインウィンドウ
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const mainWindow = new BrowserWindow({
    width: width, height: height, resizable: false, useContentSize: false, transparent: true, frame: false, toolbar: false, alwaysOnTop: true,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
    },
  });
  // mainWindow 用の HTML をロード
  mainWindow.loadFile('./src/frontend/weather/weather.html');
  mainWindow.setIgnoreMouseEvents(true, { forward: true });


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
    subWindow.loadFile('./src/frontend/setup/setup.html');
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


  ipcMain.handle('get-displays', () => {
    return screen.getAllDisplays();
  });

  ipcMain.on('message', (event, arg) => {
    if (Array.isArray(arg) && arg[0] === 'setTenkiScale') {
      const scale = arg[1];
      // mainWindow など weather.html を表示しているウィンドウに送信
      mainWindow.webContents.send('setTenkiScale', scale);
    }
  });

  ipcMain.on('message', (event, arg) => {
    if (Array.isArray(arg) && arg[0] === 'display') {
        const displayId = arg[1];
        const displays = screen.getAllDisplays();
        const targetDisplay = displays.find(d => d.id == displayId);
        if (targetDisplay && mainWindow) {
            // ディスプレイの左上座標にウィンドウを移動
            mainWindow.setBounds({
                x: targetDisplay.bounds.x,
                y: targetDisplay.bounds.y,
                width: mainWindow.getBounds().width,
                height: mainWindow.getBounds().height
            });
            mainWindow.focus();
        }
    }
});

});
