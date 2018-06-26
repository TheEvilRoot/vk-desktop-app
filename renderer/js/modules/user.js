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

var getId = (name, callback) => {
  callback = callback || (q => console.log(q));
  
  if(utils.isNumber(name) || !name) callback(name);
  else {
    vkapi.method('users.get', {
      user_ids: name
    }, data => {
      if(data.error && data.error.error_code == 113) {
        throw Error('Пользователя с таким ником нет');
      } else {
        callback(data.response[0].id);
      }
    });
  }
}

module.exports = {
  renderUser,
  load,
  getId
}
