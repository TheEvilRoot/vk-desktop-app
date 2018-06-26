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

var captcha = (src, sid, callback) => {
  let modal = document.createElement('div'),
      input = document.createElement('input'),
      btn = document.createElement('input');
  
  modal.classList.add('captcha_modal');
  input.placeholder = 'Введите капчу';
  input.classList.add('input');
  btn.classList.add('button');
  btn.value = 'Продолжить';
  
  input.addEventListener('keydown', e => {
    if(e.keyCode == 13) btn.click();
  });
  
  btn.addEventListener('click', () => {
    modal.remove();
    callback(input.value, sid);
  });
  
  modal.innerHTML = `
    <div class="captcha">
      <div class="captcha_img">
        <img src='${src}' onclick="this.src += ~this.src.indexOf('r=') ? '1' : '&r=1'">
      </div>
      <div class="captcha_info">Нажмите на картинку для обновления</div>
      <div class="captcha_key"></div>
      <div class="captcha_btn"></div>
    </div>
  `.trim();
  
  modal.children[0].children[2].appendChild(input);
  modal.children[0].children[3].appendChild(btn);
  document.body.appendChild(modal);
}

var authToken = {
  modal: null,
  init: () => {
    authToken.modal = document.createElement('div');
    authToken.modal.classList.add('modal');
    
    authToken.modal.innerHTML = `
      <div class="auth_token">
        <div class="at_header">Авторизация по токену</div>
        <div class="at_text">Если токен не имеет всех прав, то функционал приложения может быть ограничен</div>
        <input type="text" class="input at_input" placeholder="Введите access_token">
        <input type="button" value="Отмена" class="button at_cancel">
        <input type="button" value="Войти" class="button at_login" disabled>
        <div class="at_error"></div>
      </div>
    `.trim();
    
    document.body.appendChild(authToken.modal);
    
    qs('.at_cancel').addEventListener('click', () => {
      authToken.toggle();
    });
    
    qs('.at_input').addEventListener('input', e => {
      let text = e.target.value;
      
      if(text.match(/[A-z0-9]{85}/)) {
        qs('.at_login').disabled = false;
      } else qs('.at_login').disabled = true;
    });
    
    qs('.at_login').addEventListener('click', () => {
      qs('.at_error').innerHTML = '';
      qs('.at_login').disabled = true;
      
      require('./auth').authByToken(qs('.at_input').value);
    });
  },
  toggle: e => {
    if(!authToken.modal) {
      authToken.init();
      setTimeout(authToken.toggle, 100);
      return;
    }

    if(authToken.modal.classList.contains('modal_active')) {
      if(!e || e.path.indexOf(qs('.auth_token')) == -1 && e.target != qs('.token_auth')) {
        document.body.removeEventListener('click', authToken.toggle);
        authToken.modal.classList.remove('modal_active');
      }
    } else {
      document.body.addEventListener('click', authToken.toggle);
      authToken.modal.classList.add('modal_active');
    }
  }
}

var account = {
  modal: null,
  init: () => {
    account.modal = document.createElement('div');
    
    let account_list_wrap = document.createElement('div'),
        account_list = document.createElement('div');
    
    account.modal.classList.add('account_list_modal');
    account_list_wrap.classList.add('account_list_wrap');
    account_list_wrap.classList.add('theme_block');
    account_list.classList.add('account_list');
    
    account_list_wrap.innerHTML += `<div class="account_header">Выберите аккаунт</div>`;
    
    account_list.innerHTML += `
      <div class="account_item">
        <img src="images/plus.png" class="account_image account_add" onclick="modal.account.add()">
        <div class="account_names">
          <div class="account_name">Добавить аккаунт</div>
          <div class="account_login">мультиакканут не реализован</div>
        </div>
      </div>
    `.trim();
    
    users.list.forEach(user => {
      account_list.innerHTML += `
        <div class="account_item">
          <img src="${user.photo_100}" class="account_image" onclick="modal.account.set(${user.id})">
          <div class="account_names">
            <div class="account_name">${user.first_name} ${user.last_name}</div>
            <div class="account_login">${user.login || 'Вошел с помощью токена'}</div>
          </div>
        </div>
      `.trim();
    });
    
    account_list_wrap.appendChild(account_list);
    account.modal.appendChild(account_list_wrap);
    document.body.appendChild(account.modal);
  },
  toggle: e => {
    if(!account.modal) {
      account.init();
      setTimeout(account.toggle, 100);
      return;
    }
    
    if(account.modal.classList.contains('modal_active')) { // убрать
      if(!e || e.path.indexOf(qs('.account_list_wrap')) == -1 && e.target != qs('.menu_multiacc')) {
          document.body.removeEventListener('click', account.toggle);
          
          account.modal.classList.remove('modal_active');
        }
      
      qs('.menu').style.left = MENU_WIDTH;
    } else { // добавить
      account.modal.classList.add('modal_active');
      
      document.body.addEventListener('click', account.toggle);
      
      qs('.menu').style.left = MENU_WIDTH;
    }
  },
  set: () => {},
  add: () => {},
  remove: () =>{}
}

module.exports = {
  captcha,
  authToken,
  account
}
