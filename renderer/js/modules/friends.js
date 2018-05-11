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

const { request } = utils;

var load = () => {
  console.log('friends loaded');

  request({
    host: 'raw.githubusercontent.com',
    path: '/danyadev/data/master/develop'
  }, res => {
    let dev_list = Buffer.alloc(0);

    res.on('data', ch => dev_list = Buffer.concat([dev_list, ch]));
    res.on('end', () => {
      dev_list = JSON.parse(dev_list)[0];
      let block = { innerHTML: '' }

      console.log(dev_list);

      vkapi.method('execute.getFriendsAndLists', {
        func_v: 2,
        need_lists: true,
        // user_id: 300093709,
        fields: 'photo_100,online,online_app,bdate,domain,sex,verified,occupation'
      }, data => {
        data.response.items.forEach(item => {
          let verify = '';

          if(item.verified || dev_list.includes(item.id)) {
            verify = '<img class="friend_verify" src="images/verify.png">';
          }

          block.innerHTML += `
          <div class="friend_item theme_block">
            <img src="${item.photo_100}" class="friend_img">
            <div class="friend_names">
              <div class="friend_name">${item.first_name} ${item.last_name} ${verify}</div>
              <div class="friend_occupation">${item.occupation && item.occupation.name || ''}</div>
            </div>
          </div>
          `.trim();
        });

        qs('.friends_list').innerHTML += block.innerHTML;
      }, 'friend_inet_err');
    });
  }, 'friend_inet_err');
}

var render = () => {

}

module.exports = {
  load
}
