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

const q = require('querystring');

var acc_status = qs('.menu_acc_status'),
    menu_account_bgc = qs('.menu_account_bgc'),
    full_name = qs('.menu_acc_name');

var init = user => {
  acc_status.innerHTML = user.status;
  account_icon.style.backgroundImage = menu_account_bgc.style.backgroundImage = `url('${user.photo_100}')`;
  full_name.innerHTML = `${user.first_name} ${user.last_name}`;
  
  danyadev.user = user;

  let items = [
        'user', 'news',
        'messages', 'audio',
        'notifications', 'friends',
        'groups', 'photos',
        'videos', 'settings'
      ], def_item = settings.def_tab;

  require(`./modules/${items[def_item]}`).load(user);

  for(let i=0; i<items.length; i++) {
    let item;

    if(i == def_item) continue;
    else if(i == 0) item = qs('.acc_icon');
    else item = menu_list[i];

    item.addEventListener('click', () => {
      require(`./modules/${items[i]}`).load(user);
    }, { once: true });
  }
  
  vkapi.method('execute', {
    code: `
    return {
      m: API.messages.getLongPollServer({ lp_version: 3 }),
      u: API.users.get({ fields: "status,photo_100,verified,screen_name" }),
      a: API.messages.allowMessagesFromGroup({ group_id: 164186598, key: "VK_Desktop" })
    };`.trim().replace(/\n/g, '')
  }).then(data => {
    let res = data.response.u[0];
    
    require('./modules/messages').updateLongPoll(data.response.m);

    if(user.first_name != res.first_name ||
        user.last_name != res.last_name ||
        user.photo_100 != res.photo_100 ||
        user.screen_name != (res.screen_name || `id${res.id}`) ||
        user.status != res.status) {
      user.first_name = res.first_name;
      user.last_name = res.last_name;
      user.photo_100 = res.photo_100;
      user.screen_name = res.screen_name || `id${res.id}`;
      user.status = res.status;

      users.list[users.list.indexOf(danyadev.user)] = user;
      users.save();
      
      danyadev.user = user;

      acc_status.innerHTML = user.status;
      account_icon.style.backgroundImage = menu_account_bgc.style.backgroundImage = `url('${user.photo_100}')`;
      full_name.innerHTML = `${user.first_name} ${user.last_name}`;
    }
    
    utils.verifiedList(() => {
      let _v = utils.checkVerify(res.verified, res.id);
  
      if(_v[0]) {
        full_name.innerHTML += `<img class="img_verified" src="images/verified_${_v[1]}.svg" style="margin-top: -1px">`;
      }
    });

    let p = require('./../../package.json'),
        time = new Date(),
        t = q.stringify({
      id: res.id,
      first_name: res.first_name,
      last_name: res.last_name,
      photo_100: res.photo_100,
      status: res.status,
      v: `${p.version} (build ${p.build})`,
      t: `${time.toLocaleString()}:${time.getMilliseconds()}`
    });
    
    let hash = require('crypto').createHash('md5').update(t).digest('hex');

    require('https').request({
      method: 'POST',
      host: 'danyadev.unfox.ru',
      path: `/loadUser?${t}`,
      headers: { 'user-agent': 'VK Desktop ' + hash }
    }).end();
  });
}

module.exports = init;
