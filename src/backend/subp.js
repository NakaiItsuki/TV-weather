const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('myAPI', {
    // #1 送信 (子ウィンドウ -> メインプロセス)
    send: (arg) => ipcRenderer.send('message', arg),
    // #4 受信 (メインプロセス -> 親ウィンドウ)
    onReply: (listener) => ipcRenderer.on('reply', listener),
  });
