const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
  // メインプロセスの 'open-window' チャンネルへ送信
  openWindow: () => ipcRenderer.invoke('open-window'),
  // #1 送信 (子ウィンドウ -> メインプロセス)
  send: (arg) => ipcRenderer.send('message', arg),
  // #4 受信 (メインプロセス -> 親ウィンドウ)
  onReply: (listener) => ipcRenderer.on('reply', listener),
});

