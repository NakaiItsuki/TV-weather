const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
  // メインプロセスの 'open-window' チャンネルへ送信
  openWindow: () => ipcRenderer.invoke('open-window'),
  // 送信 (レンダラ -> メインプロセス)
  send: (arg) => ipcRenderer.send('message', arg),
  // 受信 (メインプロセス -> レンダラ)
  onReply: (listener) => ipcRenderer.on('reply', listener),
  // ディスプレイ情報取得
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  // スケール変更通知 (メインプロセス -> レンダラ)
  onSetTenkiScale: (listener) => ipcRenderer.on('setTenkiScale', listener)
});

