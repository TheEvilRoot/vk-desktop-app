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

var renderUser = id => {
  // id <- danyadev.user.id
  vkapi.method('execute.getFullProfileNewNew', {
    user_id: id
  }, data => {
    console.log(data);
  });
}

var load = () => {
  console.log('user loaded');
}

module.exports = {
  renderUser,
  load
}
