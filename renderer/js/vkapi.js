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

const https = require('https');
const fs = require('fs');
const querystring = require('querystring');
const { getCurrentWindow } = require('electron').remote;
const API_VERSION = '5.83';

var toURL = obj => querystring.stringify(obj);

var method = (method_name, params, target, _resolve) => {
  params = params || {};
  params.v = params.v || API_VERSION;
  params.lang = params.lang || 'ru';

  let user = users.list.find(u => u.active == true),
      id = user ? user.id : null;
  
  if(params.online) {
    params.access_token = params.access_token || danyadev.user && danyadev.user.online_token;
  } else {
    params.access_token = params.access_token || danyadev.user && danyadev.user.access_token;
  }
  
  console.log(new Date().toLocaleTimeString(), 'req:', method_name, params);
  
  return new Promise((resolve, reject) => {
    utils.request({
      host: 'api.vk.com',
      path: `/method/${method_name}?${toURL(params)}`,
      method: 'GET',
      headers: { 'User-Agent': 'VKAndroidApp/4.13.1-1206' }
    }, target).then(body => {
      body = JSON.parse(body);

      console.log(new Date().toLocaleTimeString(), 'res:', method_name, '\n', body);

      if(body.error) {
        if(body.error.error_code == 14) {
          modal.captcha(body.error.captcha_img, body.error.captcha_sid).then((key, sid) => {
            method(method_name,
                   Object.assign(params, { captcha_key: key, captcha_sid: sid }),
                   target,
                   resolve);
          });
        } else if(body.error.error_code == 5 && danyadev.user) {
          users.list.splice(users.list.indexOf(danyadev.user), 1);
          users.save();
          
          getCurrentWindow().reload();
          return;
        } else if(body.error.ban_info) {
          // TODO
        } else _resolve ? _resolve(body) : resolve(body);
      } else _resolve ? _resolve(body) : resolve(body);
    });
  });
}

var auth = (params, target, _resolve) => {
  params.login = params.login.replace(/\+/, '');
  params.platform = params.platform || 0;

  let client = utils.client_keys[params.platform];

  let reqData = {
    grant_type: 'password',
    client_id: client[0],
    client_secret: client[1],
    username: params.login,
    password: params.password,
    scope: 'all',
    '2fa_supported': true,
    force_sms: true,
    v: API_VERSION,
    lang: 'ru'
  }

  if(params.captcha_sid) {
    reqData.captcha_sid = params.captcha_sid;
    reqData.captcha_key = params.captcha_key;
  }

  if(params.code) reqData.code = params.code;
  
  return new Promise((resolve, reject) => {
    resolve = _resolve ? _resolve : resolve;
    
    utils.request({
      host: 'oauth.vk.com',
      path: `/token/?${toURL(reqData)}`
    }, target).then(body => {
      body = JSON.parse(body);
      
      console.log(new Date().toLocaleTimeString(), 'auth', '\n', body);

      if(body.error == 'need_captcha') {
        modal.captcha(body.captcha_img, body.captcha_sid).then((captcha_key, captcha_sid) => {
          auth(Object.assign({
            login: params.login,
            password: params.password,
            platform: params.platform,
            code: params.code,
            captcha_sid, captcha_key
          }, body), target, resolve);
        });
      } else resolve(Object.assign({
        login: params.login,
        password: params.password,
        platform: params.platform,
        code: params.code
      }, body));
    });
  });
};

module.exports = {
  method,
  auth
}
