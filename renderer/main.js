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

// синяя галка - 100 рублей
// золотая галка - 250 рублей

/* el.addEventListener('event', debounce(func, minTimeout));
function debounce(func, wait, immediate) {
  var timeout;
  
  return function() {
    var context = this, args = arguments,
        callNow = immediate && !timeout;
    
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if(callNow) func.apply(context, args);
  }
}
*/

window.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

const { getCurrentWindow } = require('electron').remote;

var users = Object.assign({
  save: () => localStorage.setItem('users', JSON.stringify(users)),
  list: []
}, JSON.parse(localStorage.getItem('users') || `{}`));

var settings = Object.assign({
  save: () => localStorage.setItem('settings', JSON.stringify(settings)),
  window: getCurrentWindow().getBounds(),
  volume: 1,
  def_tab: 0,
  theme: 'white',
  update: true,
  branch: 'master',
  notify_updates: true
}, JSON.parse(localStorage.getItem('settings') || '{}'));

var danyadev = {
  user: users.list.find(u => u.active == true)
};

var theme = type => {
  if(!type) qs('body').classList.add(settings.theme);
  else if(type == 'white') qs('body').classList.remove('dark');
  else qs('body').classList.add('dark');
}

const qs = e => document.querySelector(e);
const qsa = e => document.querySelectorAll(e);
const escape = t => t.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const utils = require('./js/utils');
const modal = require('./js/modal');
const vkapi = require('./js/vkapi');
const update = require('./js/update');

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
    settings_item = qs('.settings_item'),
    menu_list = [qs('.menu_account_item')];

var toggleMenu = () => {
  qs('.content_hide').classList.toggle('content_hide_active');
  
  if(menu.style.transform != 'translateX(0px)') {
    menu.style.transform = 'translateX(0px)';
    qs('.content_hide').addEventListener('click', toggleMenu);
  } else {
    menu.style.transform = 'translateX(-260px)';
    qs('.content_hide').removeEventListener('click', toggleMenu);
  }
}

window.addEventListener('beforeunload', () => {
  settings.window = getCurrentWindow().getBounds();
  settings.volume = qs('.audio').volume;
  settings.save();
});

open_menu.addEventListener('click', toggleMenu);

[].slice.call(qs('.menu_list').children).forEach(item => menu_list.push(item));

menu_list[settings.def_tab].classList.add('menu_item_active');
content.children[settings.def_tab].classList.add('content_active');

menu_list.forEach((item, tab) => {
  if(!tab) item = qs('.acc_icon');
  
  item.addEventListener('click', () => {
    toggleMenu();
    if(qs('.menu_item_active') == item) return;

    qs('.menu_item_active').classList.remove('menu_item_active');
    qs('.content_active').classList.remove('content_active');

    menu_list[tab].classList.add('menu_item_active');
    content.children[tab].classList.add('content_active');
  });
});

qs('.menu_multiacc').addEventListener('click', () => {
  toggleMenu();
  setTimeout(modal.account.toggle, 100);
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
        toggleMenu();
      }
    }
  ]);
});

if(danyadev.user) {
  wrapper_content.style.display = 'block';
  require('./js/init')(danyadev.user);
} else require('./js/auth').init();
