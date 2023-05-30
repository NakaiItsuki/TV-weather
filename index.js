"use strct";

// Electronのモジュール
const electron = require("electron");

// アプリケーションをコントロールするモジュール
const app = electron.app;

// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

//app.disableHardwareAcceleration();

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow = null;

// 全てのウィンドウが閉じたら終了
app.on("window-all-closed", () => {
  if (process.platform != "darwin") {
    app.quit();
  }
});




// Electronの初期化完了後に実行
app.on("ready", () => {
  //ウィンドウサイズを1280*720（フレームサイズを含まない）に設定する
  mainWindow = new BrowserWindow({width: 1920, height: 1080,resizable: false, useContentSize:false,transparent: true, frame: false,toolbar: false,alwaysOnTop: true});
  //mainWindow.setIgnoreMouseEvents(true);
  mainWindow.setIgnoreMouseEvents(true, {forward: true});
  //使用するhtmlファイルを指定する
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  //subWindow = new BrowserWindow({width: 320, height: 180,resizable: false,toolbar: false,alwaysOnTop: true});
  //mainWindow.setIgnoreMouseEvents(true);
  //subWindow.setIgnoreMouseEvents(true, {forward: true});
  //subWindow.loadURL(`file://${__dirname}/subindex.html`);

  


  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

});

app.on('activate', () => {
  mainWindow.setIgnoreMouseEvents(false);
});