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

var acc_status = qs('.menu_acc_status'),
    menu_account_bgc = qs('.menu_account_bgc'),
    full_name = qs('.menu_acc_name'),
    menu = qs('.menu');

var init = (users, user) => {
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
      ], def_item = settings_json.settings.def_tab;
      
  require(`./modules/${items[def_item]}`).load(user);
  
  for(let i=0; i<items.length; i++) {
    if(i == def_item) continue;
    
    menu.children[i].addEventListener('click', () => {
      require(`./modules/${items[i]}`).load(user);
    }, { once: true });
  }
  
  // добавить user_ids, куда впихивать каждого юзера.
  // (для мультиакка TODO)
  vkapi.method('users.get', {
    fields: 'status,photo_100'
  }, data => {
    let res = data.response[0];
    
    if(user.first_name != res.first_name ||
        user.last_name != res.last_name ||
        user.photo_100 != res.photo_100 ||
        user.status != res.status) {
      user.first_name = res.first_name;
      user.last_name = res.last_name;
      user.photo_100 = res.photo_100;
      user.status = res.status;
      
      users[user.id] = user;
      fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
      
      acc_status.innerHTML = user.status;
      account_icon.style.backgroundImage = menu_account_bgc.style.backgroundImage = `url('${user.photo_100}')`;
      full_name.innerHTML = `${user.first_name} ${user.last_name}`;
      
      danyadev.user = user;
    }
  });
}

module.exports = init;
