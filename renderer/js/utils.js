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

const { Menu, getCurrentWindow, shell } = require('electron').remote;
const https = require('https');

danyadev.errorData = {};

var audiolist_info = qs('.audiolist_info');

var keys = [
  [2274003, 'hHbZxrka2uZ6jB1inYsH', 'Android'           ], // 0
  [3140623, 'VeWdmVclDCtn6ihuP1nt', 'iPhone'            ], // 1
  [3682744, 'mY6CDUswIVdJLCD3j15n', 'iPad'              ], // 2
  [3697615, 'AlVXZFMUqyrnABp8ncuU', 'Windows'           ], // 3
  [2685278, 'lxhD8OD7dMsqtXIm5IUY', 'Kate Mobile'       ], // 4
  [5027722, 'Skg1Tn1r2qEbbZIAJMx3', 'VK Messenger'      ], // 5
  [4580399, 'wYavpq94flrP3ERHO4qQ', 'Snapster (Android)'], // 6
  [2037484, 'gpfDXet2gdGTsvOs7MbL', 'Symbian (Nokia)'   ], // 7
  [3502557, 'PEObAuQi6KloPM4T30DV', 'Windows Phone'     ], // 9
  [3469984, 'kc8eckM3jrRj8mHWl9zQ', 'Lynt'              ], // 10
  [3032107, 'NOmHf1JNKONiIG5zPJUu', 'Vika (Blackberry)' ]  // 11
];

var request = (params, callback, target) => {
  https.request(params, callback).on('error', e => {
    console.dir(e);

    if(target) {
      let btn = '';

      danyadev.errorData[target] = {
        defHTML: qs('.' + target).innerHTML,
        params: params,
        callback: callback
      }

      if(target == 'error_info') qs('.login_button').disabled = false;
      else btn = `<div class="no_inet_btn theme_bgc" onclick='utils.err_click("${target}")'>Повторить попытку</div>`;

      qs('.' + target).innerHTML = `
        Не удалось подключиться к сети.
        ${btn}
      `.trim();
    }
  }).end();
}

var err_click = (target) => {
  qs('.' + target).innerHTML = danyadev.errorData[target].defHTML;

  request(danyadev.errorData[target].params,
          danyadev.errorData[target].callback,
          target);
}

var app_path = (() => {
  let prod_path = process.resourcesPath.replace(/\\/g, '/') + '/app';

  if(fs.existsSync(prod_path)) return prod_path;

  return process.argv[5].replace(/--app-path=/, '').replace(/\\/g, '/');
})();

var update = (() => {
  try {
    return require(app_path + '/dev.json').update;
  } catch(e) {
    return true;
  }
})();

var openLink = el => shell.openExternal(el.dataset.url);

module.exports = {
  app_path, request, keys,
  err_click, update, openLink,
  showContextMenu: t => Menu.buildFromTemplate(t).popup(getCurrentWindow()),
  USERS_PATH: app_path + '/renderer/users.json',
  SETTINGS_PATH: app_path + '/renderer/settings.json',
  MENU_WIDTH: '-260px'
}
