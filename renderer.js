const ipc = require('electron').ipcRenderer

const asyncMsgBtn = document.getElementById('ketnoi')

asyncMsgBtn.addEventListener('click', function () {
  // ipc.send('asynchronous-message', 'ping');
  console.log('aaaaaaaaaaaaaa');
})

// ipc.on('asynchronous-reply', function (event, arg) {
//   const message = `Asynchronous message reply: ${arg}`
//   document.getElementById('async-reply').innerHTML = message
// })