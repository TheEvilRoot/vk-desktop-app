/* 
  Copyright © 2018 danyadev
  Лицензия - Apache 2.0

  Контактные данные:
   vk: https://vk.com/danyadev
   или https://vk.com/danyadev0
   telegram: https://t.me/danyadev
   github: https://github.com/danyadev/vk-desktop-app
*/

// неклик авы (execute)
// 
// var photoget=API.photos.get({album_id:"profile",rev:1,extented: 1}),
// photoid=photoget.items[0].id,
// deletep=API.photos.delete({photo_id:photoid}),
// restorep=API.photos.restore({photo_id:photoid}),
// check=API.photos.get({album_id:"profile",rev:1,extented:1});
// if(check.items.length==0)return"noclick";else return"click";
// var photoget=API.photos.get({album_id:"profile",rev:1,extented: 1}),
// photoid=photoget.items[0].id,
// deletep=API.photos.delete({photo_id:photoid}),
// restorep=API.photos.restore({photo_id:photoid}),
// check=API.photos.get({album_id:"profile",rev:1,extented:1});
// if(check.items.length==0)return"noclick";else return"click";

'use strict';

var renderUser = id => {
  // id <- danyadev.user.id
  vkapi.method('execute.getFullProfileNewNew', {
    user_id: id,
    func_v: 4,
    gift_count: 3
  }, data => {
    console.log(data);
  });
  
  vkapi.method('execute.wallGetWrapNew', {
    owner_id: id,
    extended: 1,
    fields: 'photo_100,photo_50,sex,first_name_dat,last_name_dat,video_files'
  }, data => {
    console.log(data);
  });
}

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
