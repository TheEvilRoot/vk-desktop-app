/*
  Copyright © 2018 danyadev
  Лицензия - Apache 2.0

  Контактные данные:
   vk: https://vk.com/danyadev
   telegram: https://t.me/danyadev
   альтернативная ссылка: https://t.elegram.ru/danyadev
   github: https://github.com/danyadev/vk-desktop-app
*/

'use strict';

window.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

const { getCurrentWindow } = require('electron').remote;
const fs = require('fs');
const danyadev = {};
const qs = e => document.querySelector(e);
const qsa = e => document.querySelectorAll(e);
const utils = require('./js/utils');
const { USERS_PATH, SETTINGS_PATH, MENU_WIDTH } = utils;
const theme = require('./js/theme'); theme();
const update = require('./js/update'); update();
const settings_json = require('./settings.json');
const vkapi = require('./js/vkapi');

var header = qs('.header'),
    content = qs('.content'),
    wrapper_content = qs('.wrapper_content'),
    open_menu = qs('.open_menu'),
    open_menu_icon = qs('.open_menu_icon'),
    menu = qs('.menu'),
    account_icon = qs('.acc_icon'),
    settings_item = qs('.settings_item');

window.addEventListener('beforeunload', () => {
  let settings_json_new = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));

  settings_json_new.window = getCurrentWindow().getBounds();
  settings_json_new.audio.volume = qs('.audio').volume;

  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings_json_new, null, 2));
});

menu.children[settings_json.settings.def_tab].classList.add('menu_item_active');
content.children[settings_json.settings.def_tab].classList.add('content_active');

[].slice.call(menu.children).forEach(item => {
  item.addEventListener('click', function() {
    let tab = [].slice.call(menu.children).indexOf(this);
    if(tab == 0) return; // если это блок юзера

    menu.style.left = MENU_WIDTH;
    if(qs('.menu_item_active') == this) return;

    qs('.menu_item_active').classList.remove('menu_item_active');
    qs('.content_active').classList.remove('content_active');

    menu.children[tab].classList.add('menu_item_active');
    content.children[tab].classList.add('content_active');
  });
});

menu.style.left = MENU_WIDTH; // первично скрываем панельку

open_menu.addEventListener('click', () => { // открытие/зактытие панельки
  if(menu.style.left == MENU_WIDTH) menu.style.left = '0px';
  else menu.style.left = MENU_WIDTH;
});

content.addEventListener('click', () => { // скрытие панели при клике на контент
  if(menu.style.left == '0px') menu.style.left = MENU_WIDTH;
});

header.addEventListener('click', e => { // скрытие панели при клике на шапку
  if(e.target == open_menu_icon) return;
  if(menu.style.left == '0px') menu.style.left = MENU_WIDTH;
});

account_icon.addEventListener('click', () => {
  menu.style.left = MENU_WIDTH;

  qs('.menu_item_active').classList.remove('menu_item_active');
  qs('.content_active').classList.remove('content_active');

  menu.children[0].classList.add('menu_item_active');
  content.children[0].classList.add('content_active');
});

settings_item.addEventListener('contextmenu', () => {
  utils.showContextMenu([
    {
      label: 'Открыть настройки',
      click: () => settings_item.click()
    },
    {
      label: 'Открыть DevTools',
      click: () => {
        if(getCurrentWindow().isDevToolsOpened()) getCurrentWindow().closeDevTools();
        else getCurrentWindow().openDevTools();

        menu.style.left = MENU_WIDTH;
      }
    }
  ]);
});

if(!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, '{}');

var users = fs.readFileSync(USERS_PATH, 'utf-8');

if(users.trim() == '') {
  users = {};

  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
} else users = JSON.parse(users);

var users_keys = Object.keys(users);

if(users_keys.length > 0) {
  wrapper_content.style.display = 'block';

  for(let i=0; i<users_keys.length; i++) {
    let key = users_keys[i];

    if(users[key].active) {
      require('./js/init')(users, users[key]);
      break;
    }
  }
} else require('./js/auth.js');
