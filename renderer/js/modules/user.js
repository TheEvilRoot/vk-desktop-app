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

var renderUser = id => {}

var load = () => {
  console.log('user loaded');
}

var getId = name => {
  return new Promise((resolve, reject) => {
    if(utils.isNumber(name) || !name) reject(new Error('Неверный ник'));
    else {
      vkapi.method('users.get', {
        user_ids: name
      }).then(data => {
        if(data.error && data.error.error_code == 113) {
          reject(new Error('Пользователя с таким ником нет'));
        } else resolve(data.response[0].id);
      });
    }
  });
}

module.exports = {
  renderUser,
  load,
  getId
}
