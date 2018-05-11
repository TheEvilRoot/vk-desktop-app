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

const captcha = require('./captcha');

var login_input = qs('.login_input'),
    password_input = qs('.password_input input'),
    show_password = qs('.show_password'),
    twofa_info = qs('.twofa_info'),
    error_info = qs('.error_info'),
    login_button = qs('.login_button'),
    sms_code = qs('.sms_code_input'),
    open_devTools = qs('.open_devTools'),
    wrapper_login = qs('.wrapper_login');
    
wrapper_login.style.display = 'flex';

open_devTools.addEventListener('click', () => getCurrentWindow().toggleDevTools());

show_password.addEventListener('click', () => {
  if(show_password.classList.contains('active')) {
    show_password.classList.remove('active');
    password_input.type = 'password';
  } else {
    show_password.classList.add('active');
    password_input.type = 'text';
  }
});

wrapper_login.onkeydown = e => {
  if(e.keyCode == 13) login_button.click();
}

login_input.oninput = password_input.oninput = () => {
  if(login_input.value.trim()   != '' &&
    password_input.value.trim() != '' && login_button.disabled) {
    login_button.disabled = false;
  }
  
  if(login_input.value.trim() == '' || password_input.value.trim() == '') {
    login_button.disabled = true;
  }
}

login_button.addEventListener('click', () => {
  login_button.disabled = true;
  auth();
});

var refreshToken = (data, callback) => {
  vkapi.method('auth.refreshToken', {
    access_token: data.access_token,
    receipt: 'JSv5FBbXbY:APA91bF2K9B0eh61f2WaTZvm62GOHon3-vElmVq54ZOL5PHpFkIc85WQUxUH_wae8YEUKkEzLCcUC5V4bTWNNPbjTxgZRvQ-PLONDMZWo_6hwiqhlMM7gIZHM2K2KhvX-9oCcyD1ERw4'
  }, ref => callback(ref.response.token));
};

var auth = params => {
  vkapi.auth({
    login: login_input.value,
    password: password_input.value,
    platform: 0,
    code: sms_code.value
  }, data => {
    if(data.error) {
      login_button.disabled = false;
      
      if(data.error_description == 'Username or password is incorrect') {
        error_info.innerHTML = 'Неверный логин или пароль';
      }
      
      if(data.error == 'need_validation') {
        sms_code.style.display = 'block';
        sms_code.focus();
        
        error_info.innerHTML = '';
        twofa_info.innerHTML = `Смс придет на номер ${data.phone_mask}`;
      }
      
      if(data.error_description == 'code is invalid') {
        error_info.innerHTML = 'Неверный код';
      }
      
      return;
    }
    
    error_info.innerHTML = '';
    twofa_info.innerHTML = '';
    refreshToken({ access_token: data.access_token }, ref_token => {
      vkapi.method('users.get', {
        access_token: data.access_token,
        user_id: data.user_id,
        fields: 'status,photo_100'
      }, user_info => {
        let users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8')) || {};
        
        users[data.user_id] = {
          active: true,
          id: data.user_id,
          platform: data.platform,
          login: data.login,
          password: data.password,
          downloadPath: process.env.USERPROFILE + '\\Downloads\\',
          first_name: user_info.response[0].first_name,
          last_name: user_info.response[0].last_name,
          photo_100: user_info.response[0].photo_100,
          status: user_info.response[0].status,
          access_token: ref_token,
          online_token: data.access_token
        };
    
        console.log(users[data.user_id]);
    
        fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), () => {
          wrapper_login.style.display = '';
          wrapper_content.style.display = 'block';
          
          init(users, users[data.user_id]);
        });
      }, 'error_info');
    });
  }, 'error_info');
}
