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

const { getCurrentWindow } = require('electron').remote;

var captcha = (src, sid) => {
  return new Promise((resolve, reject) => {
    let modal = document.createElement('div'),
        input = document.createElement('input'),
        btn = document.createElement('input');
    
    modal.classList.add('captcha_modal');
    
    input.placeholder = 'Введите код с картинки';
    input.classList.add('input');
    
    btn.classList.add('button');
    btn.classList.add('modal_bottom__right');
    btn.type = 'button';
    btn.value = 'Продолжить';
    
    input.addEventListener('keydown', e => {
      if(e.keyCode == 13) btn.click();
    });
    
    btn.addEventListener('click', () => {
      modal.remove();
      resolve(input.value, sid);
    });
    
    modal.innerHTML = `
      <div class="captcha">
        <div class="modal_header">
          <div class="modal_header__title">Капча</div>
        </div>
        <div class="captcha_content">
          <div class="captcha_img">
            <img src='${src}' onclick="this.src += ~this.src.indexOf('r=') ? '1' : '&r=1'">
          </div>
          <div class="captcha_info">Нажмите на картинку для обновления</div>
          <div class="captcha_key"></div>
        </div>
        <div class="modal_bottom"></div>
      </div>
    `.trim();
    
    modal.children[0].children[1].children[2].appendChild(input);
    modal.children[0].children[2].appendChild(btn);
    document.body.appendChild(modal);
  });
}

var authToken = {
  modal: null,
  init: () => {
    authToken.modal = document.createElement('div');
    authToken.modal.classList.add('modal');
    
    authToken.modal.innerHTML = `
      <div class="auth_token">
        <div class="modal_header">
          <div class="modal_header__title">Авторизация по токену</div>
          <div class="modal_header__close_wrap">
            <div class="modal_header__close"></div>
          </div>
        </div>
        <div class="at_content">
          <div class="at_text">Для полноценной работы приложения необходимы все права доступа</div>
          <input type="text" class="input at_input" placeholder="Введите access_token">
          <div class="at_error"></div>
        </div>
        <div class="modal_bottom">
          <input type="button" class="button at_login modal_bottom__right" value="Войти" disabled>
        </div>
      </div>
    `.trim();
    
    document.body.appendChild(authToken.modal);
    
    qs('.auth_token .modal_header__close_wrap').addEventListener('click', () => {
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
        authToken.modal.removeEventListener('click', authToken.toggle);
        authToken.modal.classList.remove('modal_active');
      }
    } else {
      authToken.modal.addEventListener('click', authToken.toggle);
      authToken.modal.classList.add('modal_active');
    }
  }
}

var account = {
  modal: null,
  deleted: [],
  init: () => {
    account.modal = document.createElement('div');
    account.modal.classList.add('modal');
    
    let users_list = { innerHTML: '' };
    
    users.list.forEach(user => {
      let cl = user == danyadev.user ? 'account_item_active' : '';
      
      users_list.innerHTML += `
        <div class="account_item ${cl}" data-id="${user.id}">
          <div class="account_image_wrap" onclick="modal.account.set(${user.id})">
            <img src="${user.photo_100}" class="account_image">
          </div>
          <div class="account_names">
            <div class="account_name">${user.first_name} ${user.last_name}</div>
            <div class="account_remove" onclick="modal.account.remove(this)"></div>
            <div class="account_nick">${'@' + user.screen_name}</div>
          </div>
        </div>
      `.trim();
    });
    
    account.modal.innerHTML = `
      <div class="account_list_wrap theme_block">
        <div class="modal_header">
          <div class="modal_header__title">Выберите аккаунт</div>
          <div class="modal_header__close_wrap">
            <div class="modal_header__close"></div>
          </div>
        </div>
        <div class="account_list">
          ${users_list.innerHTML}
        </div>
        <div class="modal_bottom">
          <input type="button" class="button modal_bottom__right" value="Сохранить" disabled>
          <input type="button" class="button modal_bottom__left" value="Добавить">
        </div>
      </div>
      `.trim();
    
    document.body.appendChild(account.modal);
    
    qs('.account_list_wrap .modal_header__close_wrap').addEventListener('click', () => {
      account.toggle();
    });
    
    qsa('.account_list_wrap .button')[0].addEventListener('click', () => {
      for(let i=0; i<account.deleted.length; i++) {
        let id = account.deleted[i],
            index = users.list.indexOf(users.list.find(u => u.id == id));
        
        users.list.splice(index, 1);
        qs(`.account_item[data-id="${id}"]`).remove();
      }
      
      users.save();
      account.deleted = [];
      qsa('.account_list_wrap .button')[0].disabled = true;
      
      if(users.list.find(u => u.active == true) != danyadev.user) {
        getCurrentWindow().reload();
      }
    });
    
    qsa('.account_list_wrap .button')[1].addEventListener('click', () => {
      account.add();
    });
  },
  toggle: e => {
    if(!account.modal) {
      account.init();
      setTimeout(account.toggle, 100);
      return;
    }
    
    if(account.modal.classList.contains('modal_active') && (!e || e.target == account.modal)) {
      account.modal.removeEventListener('click', account.toggle);
      account.modal.classList.remove('modal_active');
    } else {
      account.modal.addEventListener('click', account.toggle);
      account.modal.classList.add('modal_active');
    }
  },
  set: id => {
    let old_user = users.list.find(u => u.active),
        new_user = users.list.find(u => u.id == id),
        old_div = old_user ? qs(`.account_item[data-id="${old_user.id}"]`) : null,
        new_div = qs(`.account_item[data-id="${new_user.id}"]`),
        del_id = account.deleted.indexOf(id.toString());
        
    if(old_user == new_user) return;
    if(del_id != -1) account.deleted.splice(del_id, 1);
    
    if(danyadev.user && id == danyadev.user.id && !account.deleted.length) {
      qsa('.account_list_wrap .button')[0].disabled = true;
    } else {
      qsa('.account_list_wrap .button')[0].disabled = false;
    }
    
    users.list[users.list.indexOf(new_user)].active = true;
    new_div.classList.remove('account_deleted');
    new_div.classList.toggle('account_item_active');
    
    if(old_user) {
      users.list[users.list.indexOf(old_user)].active = false;
      old_div.children[1].children[1].style.display = 'block';
      old_div.classList.toggle('account_item_active');
    }
  },
  add: () => {
    account.toggle();
    setTimeout(auth.toggle, 100);
  },
  remove: elem => {
    let user = elem.parentElement.parentElement;
    
    user.classList.add('account_deleted');
    account.deleted.push(user.dataset.id);
    elem.style.display = 'none';
    qsa('.account_list_wrap .button')[0].disabled = false;
  }
}

var auth = {
  modal: null,
  init: () => {
    auth.modal = document.createElement('div');
    auth.modal.classList.add('modal');
    
    auth.modal.innerHTML = `
      <div class="account_add_wrap">
        <div class="modal_header">
          <div class="modal_header__title">Добавить аккаунт</div>
          <div class="modal_header__close_wrap">
            <div class="modal_header__close"></div>
          </div>
        </div>
        <div class="account_add">
          <input type="text" placeholder="Введите логин" class='input account_login' autofocus>
          <div class="password_wrap">
            <div class="account_show_password"></div>
            <input type="password" class="input account_password" placeholder="Введите пароль">
          </div>
          <input type="text" placeholder="Введите код из смс" class='input account_sms' style='display: none'>
          <div class="account_info"></div>
        </div>
        <div class="modal_bottom">
          <input type="button" class="button modal_bottom__right account_add_btn" value="Добавить" disabled>
        </div>
      </div>
      `.trim();
    
    document.body.appendChild(auth.modal);
    
    qs('.account_add_wrap .modal_header__close_wrap').addEventListener('click', () => {
      auth.toggle();
    });
    
    let login = qs('.account_login'),
        password = qs('.account_password'),
        sms_code = qs('.account_sms'),
        login_button = qs('.account_add_btn'),
        show_password = qs('.account_show_password');
        
    show_password.addEventListener('click', () => {
      show_password.classList.toggle('active');
      password.type == 'password' ?
          password.type = 'text'  :
          password.type = 'password';
    });
        
    login.oninput = password.oninput = sms_code.oninput = () => {
      let logpass = login.value.trim() && password.value.trim(),
          sms = !(sms_code.style.display == 'block' && !sms_code.value.trim());
      
      if(logpass && sms) login_button.disabled = false;
      else login_button.disabled = true;
    }
    
    login_button.addEventListener('click', () => {
      auth.auth(login.value, password.value, sms_code.value);
    });
  },
  toggle: e => {
    if(!auth.modal) {
      auth.init();
      setTimeout(auth.toggle, 100);
      return;
    }
    
    let onkeydown = e => {
      if(e.keyCode == 13 && !qs('.account_add_btn').disabled) {
        auth.auth(qs('.account_login').value,
                  qs('.account_password').value,
                  qs('.account_sms').value);
      }
    }
    
    if(auth.modal.classList.contains('modal_active')) { // убрать
      if(!e || e.path.indexOf(qs('.account_add_wrap')) == -1) {
        auth.modal.removeEventListener('click', auth.toggle);
        auth.modal.removeEventListener('keydown', onkeydown);
        auth.modal.classList.remove('modal_active');
        setTimeout(account.toggle, 100);
        auth.preventDefault();
      }
    } else { // добавить
      auth.modal.classList.add('modal_active');
      
      auth.modal.addEventListener('click', auth.toggle);
      auth.modal.addEventListener('keydown', onkeydown);
    }
  },
  preventDefault: () => {
    qs('.account_sms').style.display = 'none';
    qs('.account_info').innerHTML = '';
    qs('.account_login').value = '';
    qs('.account_password').value = '';
    
    qs('.account_login').disabled = false;
    qs('.account_password').disabled = false;
    qs('.account_add_btn').disabled = true;
  },
  auth: (login, password, code) => {
    let login_input = qs('.account_login'),
        password_input = qs('.account_password'),
        sms_code = qs('.account_sms'),
        login_button = qs('.account_add_btn'),
        show_password = qs('.account_show_password'),
        account_info = qs('.account_info');
    
    login_button.disabled = true;
    
    vkapi.auth({
      login: login,
      password: password,
      platform: 0,
      code: code
    }, 'error_info').then(data => {
      if(data.error && !data.access_token) {
        if(data.error == 'invalid_client' || data.error == 'invalid_request') {
          login_button.disabled = false;
          account_info.innerHTML = data.error_description;
        } else if(data.error == 'need_validation') {
          sms_code.style.display = 'block';
          sms_code.focus();
          
          account_info.innerHTML = `Смс придет на номер ${data.phone_mask}`;
          
          login_input.disabled = true;
          password_input.disabled = true;
        }
      
        return;
      }
      
      account_info.innerHTML = '';
      
      vkapi.method('users.get', {
        access_token: data.access_token,
        fields: 'status,photo_100,screen_name'
      }, 'error_info').then(user_info => {
        let user = {
          active: false,
          id: data.user_id,
          screen_name: user_info.response[0].screen_name || `id${data.user_id}`,
          platform: 0,
          login: login,
          password: password,
          first_name: user_info.response[0].first_name,
          last_name: user_info.response[0].last_name,
          photo_100: user_info.response[0].photo_100,
          status: user_info.response[0].status,
          access_token: data.access_token,
          online_token: data.access_token
        };
        
        if(users.list.find(u => u.id == user.id)) {
          account_info.innerHTML = 'Данный пользователь уже авторизован';
          login_button.disabled = false;
          login_input.disabled = false;
          password_input.disabled = false;
          
          return;
        }
      
        users.list.push(user);
        users.save();
        
        account.modal.remove();
        account.modal = null;
        account.deleted = [];
        account.toggle();
        auth.toggle();
      });
    });
  }
}

module.exports = {
  captcha,
  authToken,
  account,
  auth
}
