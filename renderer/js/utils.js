/*
  Copyright © 2018 danyadev
  Лицензия - Apache 2.0

  Контактные данные:
   vk: https://vk.com/danyadev
   или https://vk.com/danyadev0
   telegram: https://t.me/danyadev
   github: https://github.com/danyadev/vk-desktop-app
*/

'use strict';

const { Menu, getCurrentWindow, shell, app } = require('electron').remote;
const https = require('https');
const fs = require('fs');

danyadev.errorData = {};

var audiolist_info = qs('.audiolist_info');

var client_keys = [
  [2274003, 'hHbZxrka2uZ6jB1inYsH', 'Android'      ], // 0
  [3140623, 'VeWdmVclDCtn6ihuP1nt', 'iPhone'       ], // 1
  [3682744, 'mY6CDUswIVdJLCD3j15n', 'iPad'         ], // 2
  [3697615, 'AlVXZFMUqyrnABp8ncuU', 'Windows'      ], // 3
  [2685278, 'lxhD8OD7dMsqtXIm5IUY', 'Kate Mobile'  ], // 4
  [5027722, 'Skg1Tn1r2qEbbZIAJMx3', 'VK Messenger' ], // 5
  [4580399, 'wYavpq94flrP3ERHO4qQ', 'Snapster'     ], // 6
  [2037484, 'gpfDXet2gdGTsvOs7MbL', 'Symbian'      ], // 7
  [3502557, 'PEObAuQi6KloPM4T30DV', 'Windows Phone'], // 9
  [3469984, 'kc8eckM3jrRj8mHWl9zQ', 'Lynt'         ], // 10
  [3032107, 'NOmHf1JNKONiIG5zPJUu', 'Vika'         ]  // 11
];

var request = (data, target) => {
  return new Promise((resolve, reject) => {
    let req = https.request(data, res => {
      let body = Buffer.alloc(0);

      res.on('data', ch => body = Buffer.concat([body, ch]));
      res.on('end', () => resolve((body || '').toString()));
    });

    req.on('error', err => {
      if(target) {
        let btn = '';
  
        danyadev.errorData[target] = {
          defHTML: qs(`.${target}`).innerHTML,
          data: data,
          resolve: resolve
        };
  
        if(target == 'error_info') qs('.login_button').disabled = false;
        else btn = `<div class="no_inet_btn theme_bgc" onclick='utils.err_click("${target}")'>Повторить попытку</div>`;
  
        qs(`.${target}`).innerHTML = `
          Не удалось подключиться к сети.
          ${btn}
        `.trim();
      } else reject(err);
    });
    req.end();
  });
}

var err_click = target => {
  qs(`.${target}`).innerHTML = danyadev.errorData[target].defHTML;

  request(danyadev.errorData[target].params,
          target,
          danyadev.errorData[target].resolve);
}

var unix = () => {
  let homeDownloads = `${process.env.HOME}/Downloads`;
  
  try {
    return require('child_process').execSync('xdg-user-dir DOWNLOAD', { stdio: [0, 3, 3] });
  } catch(e) {}
  
  try {
    if(fs.statSync(homeDownloads)) return homeDownloads;
  } catch(e) {}

  return '/tmp/';
}

var downloadsPath = {
  darwin: () => `${process.env.HOME}/Downloads`,
  freebsd: unix,
  linux: unix,
  sunos: unix,
  win32: () => `${process.env.USERPROFILE}/Downloads`.replace(/\\/g, '/')
}[require('os').platform()]();

var verifiedList = target => {
  let _ver = {
    users: [266855437],
    groups: [-164186598],
    premium: [88262293],
    admins: [88262293, 430107477]
  };
  
  return new Promise((resolve, reject) => {
    if(danyadev.verified && danyadev.verified != _ver) {
      resolve(danyadev.verified);
      return;
    }
    
    request({
      host: 'danyadev.unfox.ru',
      path: '/getLists'
    }, target).then(body => {
      try {
        danyadev.verified = JSON.parse(body).response;
        
        resolve(danyadev.verified);
      } catch(e) {
        danyadev.verified = _ver;
        resolve(_ver);
      }
    }).catch(e => {
      danyadev.verified = _ver;
      resolve(_ver);
    });
  });
}

var checkVerify = (off, id) => {
  let verified = false,
      p = danyadev.verified.premium.includes(id) ||
          danyadev.verified.groups.includes(id),
      type = p ? 'gold' : 'blue';
  
  if(off || danyadev.verified.users.includes(id) || p) verified = true;
  
  return [verified, type];
}

module.exports = {
  request, client_keys, verifiedList,
  err_click, downloadsPath, checkVerify,
  openLink: url => shell.openExternal(url),
  showContextMenu: t => Menu.buildFromTemplate(t).popup(getCurrentWindow()),
  isNumber: n => !isNaN(parseFloat(n)) && isFinite(n),
  random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  app_path: app.getAppPath().replace(/\\/g, '/')
}
