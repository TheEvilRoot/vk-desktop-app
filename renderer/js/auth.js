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

var wrapper_login = document.createElement('div');
wrapper_login.classList.add('wrapper_login');

wrapper_login.innerHTML = `
  <div class="open_multiacc" title='Открыть меню выбора аккаунтов'></div>
  <div class="open_devTools" title='Открыть DevTools'></div>
  <img class="login_logo" src="images/logo.jpg">
  <div class="login_title">VK Desktop</div>
  <div class="input_form">
    <input type="text" placeholder="Введите логин" class='input login_input' autofocus>
    <div class="password_input">
      <div class="show_password"></div>
      <input type="password" class="input" placeholder="Введите пароль">
    </div>
    <input type="text" placeholder="Введите код из смс" class='input sms_code_input' style='display: none'>
    <div class="twofa_info"></div>
    <input type="button" value="Отмена" class='button login_cancel' style='display: none'>
    <input type="button" value="Войти" class='button login_button' disabled>
  </div>
  <div class="error_info"></div>
  <div class="bottom_info">
    <div class='link token_auth' onclick='modal.authToken.toggle()'>Войти через access_token</div>
  </div>
`.trim();

var init = () => {
  document.body.insertBefore(wrapper_login, document.body.firstChild);
  
  var login_input = qs('.login_input'),
      password_input = qs('.password_input input'),
      show_password = qs('.show_password'),
      twofa_info = qs('.twofa_info'),
      error_info = qs('.error_info'),
      login_button = qs('.login_button'),
      sms_code = qs('.sms_code_input'),
      login_cancel = qs('.login_cancel');
  
  qs('.open_devTools').addEventListener('click', () => getCurrentWindow().toggleDevTools());
  
  show_password.addEventListener('click', () => {
    show_password.classList.toggle('active');
    password_input.type == 'password' ?
        password_input.type = 'text'  :
        password_input.type = 'password';
  });
  
  wrapper_login.onkeydown = e => {
    if(e.keyCode == 13) login_button.click();
  }
  
  login_input.oninput = password_input.oninput = sms_code.oninput = () => {
    if(login_input.value.trim() && password_input.value.trim()
    && !(sms_code.style.display == 'block' && !sms_code.value.trim())) {
      login_button.disabled = false;
    } else login_button.disabled = true;
  }
  
  login_button.addEventListener('click', () => {
    login_button.disabled = true;
    error_info.innerHTML = '';
    wrapper_login.style.marginTop = '';
    auth();
  });
  
  login_cancel.addEventListener('click', () => {
    login_cancel.style.display = 'none';
    login_button.style.display = 'block';
    login_button.style.width = '250px';
    wrapper_login.style.marginTop = '';
    
    sms_code.style.display = 'none';
    twofa_info.innerHTML = '';
    login_input.value = '';
    password_input.value = '';
    error_info.innerHTML = '';
    
    login_button.disabled = true;
    login_input.disabled = false;
    password_input.disabled = false;
  });
  
  qs('.open_multiacc').addEventListener('click', () => {
    modal.account.toggle();
  });
}

var auth = params => {
  var login_input = qs('.login_input'),
      password_input = qs('.password_input input'),
      twofa_info = qs('.twofa_info'),
      error_info = qs('.error_info'),
      login_button = qs('.login_button'),
      sms_code = qs('.sms_code_input'),
      login_cancel = qs('.login_cancel');
  
  vkapi.auth({
    login: login_input.value,
    password: password_input.value,
    platform: 0,
    code: sms_code.value
  }, 'error_info').then(data => {
    if(data.error && !data.access_token) {
      if(data.error == 'invalid_client' || data.error == 'invalid_request') {
        login_button.disabled = false;
        wrapper_login.style.marginTop = '10px';
        error_info.innerHTML = data.error_description;
      } else if(data.error == 'need_validation') {
        sms_code.style.display = 'block';
        sms_code.focus();
    
        error_info.innerHTML = '';
        twofa_info.innerHTML = `Смс придет на номер ${data.phone_mask}`;
    
        login_cancel.style.display = 'inline-block';
        login_button.style.display = 'inline-block';
        login_button.style.width = '123px';
        login_cancel.style.width = '123px';
        wrapper_login.style.marginTop = '10px';
    
        login_input.disabled = true;
        password_input.disabled = true;
      }
    
      return;
    }
    
    login_cancel.style.display = 'none';
    login_button.style.display = 'block';
    login_button.style.width = '250px';
    wrapper_login.style.marginTop = '';
    
    error_info.innerHTML = '';
    twofa_info.innerHTML = '';
    
    vkapi.method('users.get', {
      access_token: data.access_token,
      fields: 'status,photo_100,screen_name'
    }, 'error_info').then(user_info => {
      let user = {
        active: true,
        id: data.user_id,
        screen_name: user_info.response[0].screen_name || `id${data.user_id}`,
        platform: data.platform,
        login: data.login,
        password: data.password,
        first_name: user_info.response[0].first_name,
        last_name: user_info.response[0].last_name,
        photo_100: user_info.response[0].photo_100,
        status: user_info.response[0].status,
        access_token: data.access_token,
        online_token: data.access_token
      };
    
      wrapper_login.remove();
      wrapper_content.style.display = 'block';
    
      users.list.push(user);
      users.save();
      modal.account.modal = null;
      modal.account.deleted = [];
    
      require('./init')(user);
    });
  });
}

var authByToken = token => {
  vkapi.method('users.get', {
    access_token: token,
    fields: 'status,photo_100,screen_name'
  }, data => {
    if(data.error) {
      if(data.error.error_code == 5) {
        qs('.at_error').innerHTML = 'Неверный access_token';
      } else {
        qs('.at_error').innerHTML = 'Неизвестная ошибка';
      }
      
      qs('.at_login').disabled = false;
      return;
    }
    
    let user = {
      active: true,
      id: data.response[0].id,
      screen_name: data.screen_name || `id${data.user_id}`,
      platform: 0,
      first_name: data.response[0].first_name,
      last_name: data.response[0].last_name,
      photo_100: data.response[0].photo_100,
      status: data.response[0].status,
      access_token: token,
      online_token: token
    };
    
    users.list.push(user);
    users.save();
    
    wrapper_login.remove();
    wrapper_content.style.display = 'block';
    
    modal.account.modal = null;
    modal.account.deleted = [];
    modal.authToken.toggle();
    require('./init')(user);
  });
}

module.exports = {
  init,
  authByToken
}
