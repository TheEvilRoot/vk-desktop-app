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

var init = () => {
  var wrapper_login = document.createElement('div');
  wrapper_login.classList.add('wrapper_login');
  
  wrapper_login.innerHTML = `
    <div class="open_devTools" title='Открыть DevTools'></div>
    <img class="login_logo" src="images/logo.jpg">
    <div class="login_title">VK Desktop</div>
    <div class="input_form">
      <input type="text" placeholder="Введите логин" class='login_input' autofocus>
      <div class="password_input">
        <div class="show_password"></div>
        <input type="password" placeholder="Введите пароль">
      </div>
      <input type="text" placeholder="Введите код из смс" class='sms_code_input' style='display: none'>
      <div class="twofa_info"></div>
      <input type="button" value="Отмена" class='login_cancel' style='display: none'>
      <input type="button" value="Войти" class='login_button' disabled>
    </div>
    <div class="error_info" style='color: red;'></div>
    <div class="bottom_info">
      <div class='link token_auth' onclick='require("./js/auth").toggleModal()'>Войти через access_token</div>
    </div>
  `.trim();
  
  document.body.insertBefore(wrapper_login, document.body.firstChild);
  
  var login_input = qs('.login_input'),
      password_input = qs('.password_input input'),
      show_password = qs('.show_password'),
      twofa_info = qs('.twofa_info'),
      error_info = qs('.error_info'),
      login_button = qs('.login_button'),
      sms_code = qs('.sms_code_input'),
      open_devTools = qs('.open_devTools');
  
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
  
  login_input.oninput = password_input.oninput = sms_code.oninput = () => {
    if(login_input.value.trim() != '' && password_input.value.trim() != ''
    && !(sms_code.style.display == 'block' && !sms_code.value.trim())) {
      login_button.disabled = false;
    } else login_button.disabled = true;
  }
  
  login_button.addEventListener('click', () => {
    login_button.disabled = true;
    auth();
  });
  
  qs('.login_cancel').addEventListener('click', () => {
    qs('.login_cancel').style.display = 'none';
    qs('.login_button').style.display = 'block';
    qs('.login_button').style.width = '250px';
    
    sms_code.style.display = 'none';
    twofa_info.innerHTML = '';
    
    login_button.disabled = true;
    login_input.disabled = false;
    password_input.disabled = false;
    
    login_input.value = '';
    password_input.value = '';
  });
  
  var auth = params => {
    vkapi.auth({
      login: login_input.value,
      password: password_input.value,
      platform: 0,
      code: sms_code.value
    }, data => {
      if(data.error && !data.access_token) {
        if(data.error_description == 'Username or password is incorrect') {
          login_button.disabled = false;
          
          error_info.innerHTML = 'Неверный логин или пароль';
        }
        
        if(data.error == 'need_validation') {
          sms_code.style.display = 'block';
          sms_code.focus();
          
          error_info.innerHTML = '';
          twofa_info.innerHTML = `Смс придет на номер ${data.phone_mask}`;
          
          qs('.login_cancel').style.display = 'inline-block';
          qs('.login_button').style.display = 'inline-block';
          qs('.login_button').style.width = '123px';
          qs('.login_cancel').style.width = '123px';
          
          login_input.disabled = true;
          password_input.disabled = true;
        }
        
        if(data.error_description == 'code is invalid') {
          login_button.disabled = false;
          
          error_info.innerHTML = 'Неверный код';
        }
        
        return;
      }
      
      qs('.login_cancel').style.display = 'none';
      qs('.login_button').style.display = 'block';
      qs('.login_button').style.width = '250px';
      
      error_info.innerHTML = '';
      twofa_info.innerHTML = '';
      
      vkapi.method('users.get', {
        access_token: data.access_token,
        fields: 'status,photo_100'
      }, user_info => {
        let users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8')) || {};
        
        users[data.user_id] = {
          active: true,
          id: data.user_id,
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
    
        console.log(new Date().toLocaleTimeString(), users[data.user_id]);
    
        fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
        
        wrapper_login.remove();
        wrapper_content.style.display = 'block';
        
        require('./init')(users, users[data.user_id]);
      }, 'error_info');
    }, 'error_info');
  }
}

let auth_token_modal = document.createElement('div');
auth_token_modal.classList.add('auth_token_modal');

auth_token_modal.innerHTML = `
  <div class="auth_token">
    <div class="at_header">Авторизация по токену</div>
    <div class="at_text">Для такой авторизации есть ограничение - токен должен быть получен через приложение для Android (его id 2274003)</div>
    <input type="text" class="at_input" placeholder="Введите access_token">
    <input type="button" value="Отмена" class="at_btn at_cancel">
    <input type="button" value="Войти" class="at_btn at_login" disabled>
    <div class="at_error"></div>
  </div>
`.trim();

document.body.appendChild(auth_token_modal);

qs('.at_cancel').addEventListener('click', () => {
  toggleModal();
});

qs('.at_input').addEventListener('input', e => {
  let text = e.target.value;
  
  if(text.length == 85 && text.match(/[A-z0-9]{75}/)) {
    qs('.at_login').disabled = false;
  } else qs('.at_login').disabled = true;
});

qs('.at_login').addEventListener('click', () => {
  qs('.at_error').innerHTML = '';
  qs('.at_login').disabled = true;
  
  authByToken(qs('.at_input').value);
});

var toggleModal = e => {
  if(auth_token_modal.classList.contains('almv')) {
    if(!e || e.path.indexOf(qs('.auth_token')) == -1 && e.target != qs('.token_auth')) {
        document.body.removeEventListener('click', toggleModal);
        
        auth_token_modal.classList.remove('almv');
      }
  } else {
    auth_token_modal.classList.add('almv');
    
    document.body.addEventListener('click', toggleModal);
  }
}

var authByToken = token => {
  vkapi.method('execute', {
    access_token: token,
    code: `
      return {
        t: API.execute.getNewsfeedSmart(),
        u: API.users.get({ fields: "status,photo_100" })
      };
    `
  }, data => {
    if(data.error) {
      if(data.error.error_code == 5) {
        qs('.at_error').innerHTML = 'Неверный access_token';
      } else if(data.error.error_code == 13) {
        qs('.at_error').innerHTML = 'Токен не с Android';
      }
      
      qs('.at_login').disabled = false;
      
      return;
    }
    
    let users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8')) || {},
        user_info = data.response.u[0];
    
    users[user_info.id] = {
      active: true,
      id: user_info.id,
      platform: 0,
      first_name: user_info.first_name,
      last_name: user_info.last_name,
      photo_100: user_info.photo_100,
      status: user_info.status,
      access_token: token,
      online_token: token
    };

    console.log(new Date().toLocaleTimeString(), users[data.user_id]);

    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    
    qs('.wrapper_login').remove();
    qs('.wrapper_content').style.display = 'block';
    
    require('./init')(users, users[data.user_id]);
  });
}

module.exports = { init, toggleModal };
