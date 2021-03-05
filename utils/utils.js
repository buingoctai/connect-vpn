const exec = require('child_process').exec;
const fetch = require('node-fetch');
const os = require('os');
const { authenticator } = require('otplib');
const {ipcRenderer} =require('electron');
const {
  USER_NAME,
  PASSWORD,
  AUTHENTICATOR_SECRET,
  HOST_NAME,
} = require('../config');
const { OVPN_PATH_WIN, OVPN_PATH_MAC } = require('./constants');

const OPENVPN_PATH = os.platform() === 'win32' ? OVPN_PATH_WIN : OVPN_PATH_MAC;
const QUIT_APP = os.platform() === 'win32' ? 'taskkill /IM ovpntray.exe' : '';

const quitApp = () => {
  const command = QUIT_APP;

  return new Promise((resolve, reject) => {
    const process = exec(command);

    process.on('exit', (code) => {
      console.log('killApp code', code);
      if (code === 0) return resolve();
      return reject();
    });
  });
};
const disconnect = () => {
  const command = `${OPENVPN_PATH} disconnect`;

  return new Promise((resolve, reject) => {
    const process = exec(command);
    process.stdout.on('data', (data) => {
      console.log('disconnect data', data);
    });
    process.stderr.on('data', (data) => {
      console.log('disconnect error', data);
    });
    process.on('exit', (code) => {
      console.log('disconnect code', code);
      if (code === 0) return resolve();
      return reject();
    });
  });
};
const initConnection = async (vpn) => {
  const command = `${OPENVPN_PATH} -t ${vpn.hostName} -u ${vpn.userName} -p ${
    vpn.password + authenticator.generate(vpn.authencation)
  } -i allow -U connect`; //lệnh connect vpn

  return new Promise((resolve, reject) => {
    const process = exec(command);
    process.stdout.on('data', (data) => {
      console.log('xxxxxx',data);
      if (data.includes('AUTH_FAILED')) {
        console.log('authen failed reject');
        reject(data);
      }
    });
    process.stderr.on('data', (data) => {
      console.log('initConnection error', data);
      reject(data);
    });

    process.on('exit', () => {
      retryFetch('https://zalogit2.zing.vn/zalo-pc/zalo-pc-app', {
        mode: 'no-cors',
      })
        .then((res) => {
          // console.log('retryFetch res', res);
          console.log('-----------------------------------');
          console.log('Kết nối VPN thành công!');
          resolve();
        })
        .catch((err) => {
          console.log('retryFetch err', err);
          reject();
        });
    });
  });
};

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};
const retryFetch = (
  url,
  fetchOptions = {},
  retries = 3,
  retryDelay = 3000,
  timeout
) => {
  return new Promise((resolve, reject) => {
    // reject if exceed time
    if (timeout) {
      setTimeout(() => {
        console.log('in time out');
        reject('error: timeout'); // reject if over time
      }, timeout);
    }
    const wrapper = (n) => {
      fetch(url, fetchOptions)
        .then((res) => {
          resolve(res);
        })
        .catch(async (err) => {
          if (n > 0) {
            await delay(retryDelay);
            wrapper(--n);
          } else {
            reject(err);
          }
        });
    };
    wrapper(retries);
  });
};

const connectVPN = (vpn) => {
  return new Promise(async (resolve, reject) => {
    try {
      // await quitApp();
      await disconnect();
      await initConnection(vpn);
      resolve(true);
    } catch (err) {
      console.log('connectVPN error', err);
      reject(err);
    }
  });
};
module.exports = connectVPN;
