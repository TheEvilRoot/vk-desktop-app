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

var account_list_modal = document.createElement('div'),
    account_list_wrap = document.createElement('div'),
    account_list = document.createElement('div');

account_list_wrap.classList.add('account_list_wrap');
account_list_wrap.classList.add('theme_block');
account_list_modal.classList.add('account_list_modal');
account_list.classList.add('account_list');

account_list_wrap.innerHTML += `<div class="account_header">Выберите аккаунт</div>`;

account_list.innerHTML += `
  <div class="account_item">
    <img src="images/plus.png" class="account_image account_add" onclick="require('./js/account').add()">
    <div class="account_names">
      <div class="account_name">Добавить аккаунт</div>
      <div class="account_login">мультиакканут не реализован</div>
    </div>
  </div>
`.trim();

var init = () => {
  let users = require(USERS_PATH);
  
  Object.keys(users).forEach(id => {
    let user = users[id];
    
    account_list.innerHTML += `
      <div class="account_item">
        <img src="${user.photo_100}" class="account_image" onclick="require('./js/account').set(${user.id})">
        <div class="account_names">
          <div class="account_name">${user.first_name} ${user.last_name}</div>
          <div class="account_login">${user.login}</div>
        </div>
      </div>
    `.trim();
  });
  
  account_list_wrap.appendChild(account_list);
  account_list_modal.appendChild(account_list_wrap);
  document.body.appendChild(account_list_modal);
  
  //toggle();
  
  qs('.menu_multiacc').addEventListener('click', () => {
    toggle();
  });
}

var toggle = e => {
  if(account_list_modal.classList.contains('almv')) { // убрать
    if(!e || e.path.indexOf(qs('.account_list_wrap')) == -1 && e.target != qs('.menu_multiacc')) {
        document.body.removeEventListener('click', toggle);
        
        account_list_modal.classList.remove('almv');
      }
    
    qs('.menu').style.left = MENU_WIDTH;
  } else { // добавить
    account_list_modal.classList.add('almv');
    
    document.body.addEventListener('click', toggle);
    
    qs('.menu').style.left = MENU_WIDTH;
  }
}

var add = () => {
  console.log('Добавление аккаунта');
}

var remove = () => {}

var set = () => {
  console.log('Установка аккаунта');
}

module.exports = {
  init,
  toggle,
  add,
  remove,
  set
}
