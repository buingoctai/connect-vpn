const { app, BrowserWindow ,ipcMain } = require('electron')
const exec = require('child_process').exec;
const connectVPN = require('./utils/utils');

let win;
let isAddInterval = false;
let intervalCall= null;
function createWindow () {
    win = new BrowserWindow({
    width: 700,
    height: 1500,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

function displayForm(){
    win.webContents.executeJavaScript(`
    document.getElementById("form").style.display = "block";

    `);
}

function hiddenBtns(){
    win.webContents.executeJavaScript(`
    document.getElementById("reset").style.display = "none";
    document.getElementById("reset-title").style.display = "none";
    `);
}
//----------------------------
function hideForm(){
    win.webContents.executeJavaScript(`
    document.getElementById("form").style.display = "none";

    `);
}
function test(){
    console.log('xasjdhsajdkjasd');
}
function displayBtns(){
    win.webContents.executeJavaScript(`
        const reset = document.getElementById("reset");
        document.getElementById("reset-title").style.display = "block";
        reset.style.display = "block";
        reset.addEventListener('click',()=>{
            localStorage.removeItem("vpn");
        });
    `);
}


function listenEvent(){
    win.webContents.executeJavaScript(`
    document.getElementById("submit").addEventListener("click",()=>{
        const hostName=document.getElementById('hostname').value;
        const userName=document.getElementById('username').value;
        const password=document.getElementById('password').value;
        const authencation=document.getElementById('authencation').value;

        const vpn={hostName: hostName, userName:userName,password:password, authencation:authencation};
        const vpnStr=JSON.stringify(vpn);
        localStorage.setItem('vpn', vpnStr)
    })
    `)
}
function removeVPN(){
    win.webContents.executeJavaScript(`
        localStorage.removeItem("vpn");
`);
}
function addNoti(msg){
    win.webContents.executeJavaScript(`
    document.getElementById("noti").textContent='${msg}';
`);
}
function checkInterval(){
    win.webContents
    .executeJavaScript('localStorage.getItem("vpn");', true)
    .then(result => {
        
        if(result) {
            const vpn = JSON.parse(result);
            console.log('aaa',vpn);
           
            clearInterval(intervalCall);
            addNoti('Đang kết nối vpn... Vui lòng không click lung tung!');
            connectVPN(vpn)
            .then(()=>{
                addNoti('Kết nối vpn thành công. Có thể đóng app.');
                hideForm();
                displayBtns();
            })
            .catch((err)=>{
                console.log('LỖI KẾT NỐI VPN',err);
                addNoti(`Kết nối vpn thất bại ${JSON.stringify(err)}`);
                removeVPN();
                isAddInterval=false;
                checkInterval();
            });
          
        }else{
            displayForm();
            hiddenBtns();
            listenEvent();
            console.log('isAddInterval',isAddInterval);
            if(!isAddInterval){
                intervalCall= setInterval(()=>{
                    isAddInterval=true;
                    checkInterval();
                },2000);
            }
        }
    });
}


app.on('ready',()=>{
    createWindow();
    // win.webContents.openDevTools();
    checkInterval();
  
});





