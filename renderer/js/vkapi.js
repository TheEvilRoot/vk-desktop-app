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

// Методы для получения серверов для загрузки и самой загрузки файлов (TODO)
// истории: https://vk.com/blog/stories-api
/*                      [upload_field_name, step_one_method_name, step_two_method_name]

UFT_AUDIO:              ['file', 'audio.getUploadServer', 'audio.save'],
UFT_COVER:              ['photo', 'photos.getOwnerCoverPhotoUploadServer', 'photos.saveOwnerCoverPhoto'],
UFT_DOCUMENT:           ['file', 'docs.getUploadServer', 'docs.save'],
UFT_DOCUMENT_PM:        ['file', 'docs.getMessagesUploadServer', 'docs.save'],
UFT_DOCUMENT_WALL:      ['file', 'docs.getWallUploadServer', 'docs.save'],
UFT_PHOTO_ALBUM:        ['file', 'photos.getUploadServer', 'photos.save'],
UFT_PHOTO_MAIN:         ['photo', 'photos.getOwnerPhotoUploadServer', 'photos.saveOwnerPhoto'],
UFT_PHOTO_MARKET:       ['file', 'photos.getMarketUploadServer', 'photos.saveMarketPhoto'],
UFT_PHOTO_MARKET_ALBUM: ['file', 'photos.getMarketAlbumUploadServer', 'photos.saveMarketAlbumPhoto'],
UFT_PHOTO_PM:           ['photo', 'photos.getMessagesUploadServer', 'photos.saveMessagesPhoto'],
UFT_PHOTO_WALL:         ['photo', 'photos.getWallUploadServer', 'photos.saveWallPhoto'],
UFT_VIDEO:              ['video_file', 'video.save']
*/

// var signedPost = message => {
//   vkapi.method('wall.post', {
//     signed: 1,
//     message: message,
//     owner_id: 88262293,
//     publish_date: parseInt(new Date().getTime()/1000) + 60
//   });
// }

const https = require('https');
const fs = require('fs');
const querystring = require('querystring');
const { getCurrentWindow } = require('electron').remote;
const API_VERSION = '5.80';

var toURL = obj => querystring.stringify(obj);

var method = (method_name, params, target, _resolve) => {
  params = params || {};
  params.v = params.v || API_VERSION;

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
          modal.captcha(body.error.captcha_img, body.error.captcha_sid, (key, sid) => {
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
    v: API_VERSION
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
        qs('.login_button').disabled = false;
        
        modal.captcha(body.captcha_img, body.captcha_sid, (captcha_key, captcha_sid) => {
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
