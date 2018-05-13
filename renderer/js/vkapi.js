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

/*
  function post(message) {
    vkapi.method('wall.post', {
      from_group: 1,
      signed: 1,
      message: message,
      owner_id: 88262293,
      publish_date: parseInt(new Date().getTime()/1000) + 60
    });
  }
*/

const https = require('https');
const fs = require('fs');
const querystring = require('querystring');
const { getCurrentWindow } = require('electron').remote;
const { request, client_keys } = utils;
const API_VERSION = 5.74;
const captcha = require('./captcha');

var toURL = obj => querystring.stringify(obj),
    online_methods = [
      'account.setOnline', 'account.setOffline',
      'messages.getDialogs', 'messages.send',
      'messages.sendSticker', 'wall.post',
      'newsfeed.get'
    ]; // wall.post (без publish_date)

var method = (method_name, params, callback, target) => {
  params   = params   || {};
  callback = callback || (() => {});
  params.v = params.v || API_VERSION;

  let id, users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));

  Object.keys(users).forEach(user_id => {
    if(users[user_id].active) id = user_id;
  });

  console.log(method_name, params);
  process.log('\nAPI REQ: ' + method_name)

  params.access_token = params.access_token || users[id].access_token;

  request({
    host: 'api.vk.com',
    path: `/method/${method_name}?${toURL(params)}`,
    method: 'GET',
    headers: { 'User-Agent': 'VKAndroidApp/4.13.1-1206' }
  }, res => {
    let body = Buffer.alloc(0);

    res.on('data', ch => body = Buffer.concat([body, ch]));
    res.on('end', () => {
      body = body.toString();

      if(body[0] == '<') {
        let a = document.createElement('div');
        a.innerHTML = body;

        body = {
          error: a.getElementsByTagName('title')[0].outerText
        };
      } else body = JSON.parse(body);

      console.log(body);

      if(body.error) {
        if(body.error.error_code == 14) {
          captcha(body.error.captcha_img, body.error.captcha_sid, (key, sid) => {
            method(method_name,
                   Object.assign(params, { captcha_key: key, captcha_sid: sid }),
                   callback,
                   target);
          });
        }

        if(body.error.error_msg == 'User authorization failed: invalid session.') {
          console.log(body.error.error_code);
          // можно будет выводить окошечко с формой входа, где будет логин и пароль уже введен
          delete users[id];

          if(Object.keys(users).length > 0) users[Object.keys(users)[0]].active = true;
          fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
          getCurrentWindow().reload();
        } else if(body.error.ban_info) {
          qs('.user_banned').style.display = 'block';
        }
      } else callback(body);
    });
  }, target);
}

var auth = (params, callback, target) => {
  let users = fs.readFileSync(USERS_PATH, 'utf-8');

  params.login = params.login.replace('+', '');
  params.platform = params.platform || 0;
  callback = callback || (() => {});

  let client = client_keys[params.platform];

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

  request({
    host: 'oauth.vk.com',
    path: `/token/?${toURL(reqData)}`
  }, res => {
    let body = Buffer.alloc(0);

    res.on('data', ch => body = Buffer.concat([body, ch]));
    res.on('end', () => {
      body = JSON.parse(body);
      users = JSON.parse(users);

      if(body.error == 'need_captcha') {
        qs('.login_button').disabled = false;

        captcha(body.captcha_img, body.captcha_sid, (key, sid) => {
          auth(Object.assign(body, params, { captcha_key: key, captcha_sid: sid }),
               callback,
               target);
        });
      } else callback(Object.assign(body, params));
    });
  }, target);
};

var longpoll = (params, callback) => {
  let options = {
    act: 'a_check',
    key: params.key,
    ts: params.ts,
    wait: params.wait || 25,
    mode: params.mode || 2,
    version: params.version || 2
  }

  request(`https://${params.server}?${toURL(options)}`, data => {
    console.log(data);
  });
};

module.exports = {
  method,
  auth
}
