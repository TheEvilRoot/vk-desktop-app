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

const { request, verifiedList } = utils;

var load = () => verifiedList(list => render(list[0]), 'friend_inet_err');

var render = dev_list => {
  let block = { innerHTML: '' }
  
  vkapi.method('execute.getFriendsAndLists', {
    func_v: 2,
    need_lists: true,
    fields: 'photo_100,online,online_app,bdate,domain,sex,verified,occupation'
  }, data => {
    data.response.items.forEach(item => {
      let verify = '';
  
      if(item.verified || dev_list.includes(item.id)) {
        verify = '<img class="img_verified" src="images/verify.png">';
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
}

module.exports = {
  load
}
