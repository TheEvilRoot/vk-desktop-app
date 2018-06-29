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
const danyadev = {};
const MENU_WIDTH = '-260px';
const qs = e => document.querySelector(e);
const qsa = e => document.querySelectorAll(e);
const utils = require('./js/utils');
const modal = require('./js/modal');
const vkapi = require('./js/vkapi');
const theme = require('./js/theme');
const update = require('./js/update');

var users = JSON.parse(localStorage.getItem('users') || `{"list":[]}`),
    settings = JSON.parse(localStorage.getItem('settings') || '{}');

settings = Object.assign({
  window: getCurrentWindow().getBounds(),
  volume: 1,
  def_tab: 0,
  theme: 'white',
  update: true,
  branch: 'master',
  notify_updates: true
}, settings);

users.save = () => localStorage.setItem('users', JSON.stringify(users));
settings.save = () => localStorage.setItem('settings', JSON.stringify(settings));

theme();
update.check();

var updateTimer = setInterval(update.check, 1000 * 60 * 5);

var header = qs('.header'),
    content = qs('.content'),
    wrapper_content = qs('.wrapper_content'),
    open_menu = qs('.open_menu'),
    open_menu_icon = qs('.open_menu_icon'),
    menu = qs('.menu'),
    account_icon = qs('.acc_icon'),
    settings_item = qs('.settings_item');

window.addEventListener('beforeunload', () => {
  settings.window = getCurrentWindow().getBounds();
  settings.volume = qs('.audio').volume;
  settings.save();
});

menu.children[settings.def_tab].classList.add('menu_item_active');
content.children[settings.def_tab].classList.add('content_active');

[].slice.call(menu.children).forEach(item => {
  item.addEventListener('click', function() {
    let tab = [].slice.call(menu.children).indexOf(this);
    if([-1, 0, 10].includes(tab)) return;

    menu.style.left = MENU_WIDTH;
    if(qs('.menu_item_active') == this) return;

    qs('.menu_item_active').classList.remove('menu_item_active');
    qs('.content_active').classList.remove('content_active');

    menu.children[tab].classList.add('menu_item_active');
    content.children[tab].classList.add('content_active');
  });
});

var close_menu = e => {
  if(!e) menu.style.left = MENU_WIDTH;
  else {
    if(e.path.indexOf(qs('.menu')) == -1 && e.target != open_menu_icon) {
      menu.style.left = MENU_WIDTH;
      
      document.body.removeEventListener('click', close_menu);
    }
  }
}

open_menu.addEventListener('click', () => {
  menu.style.left = 0;
  
  document.body.addEventListener('click', close_menu);
});

account_icon.addEventListener('click', () => {
  close_menu();

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
        getCurrentWindow().toggleDevTools();
        close_menu();
      }
    }
  ]);
});

danyadev.user = users.list.find(u => u.active == true);

if(danyadev.user) {
  wrapper_content.style.display = 'block';
  require('./js/init')(danyadev.user);
} else require('./js/auth').init();
