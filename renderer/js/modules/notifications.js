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

var start_from = '',
    nots_list = qs('.notifications_list');

var load = () => {
  utils.verifiedList(getNotifications, 'notifications_item_err');
}

var getNotifications = () => {
  vkapi.method('notifications.get', {
    start_from: start_from
  }, data => {
    start_from = data.response.next_from;
    
    if(start_from == undefined) {
      qs('.notifications_item_err').innerHTML = 'Показаны последние уведомления';
      
      return;
    }
    
    let block = { innerHTML: '' };
    
    for(let i=0; i<data.response.items.length; i++) {
      let item = data.response.items[i];
      
      if(item.icon_type == 'mention') {
        block.innerHTML += `
          <div class="block">
            Упоминание\n
            ${item.header} ${item.footer}\n
            ${item.text}
          </div>
        `.trim();
      } else if(item.icon_type == 'comment') {
        block.innerHTML += `
          <div class="block">
            Комментарий\n
            ${item.header} ${item.footer}
          </div>
        `.trim();
      } else if(item.icon_type == 'like') {
        block.innerHTML += `
          <div class="block">
            Лайк\n
            ${item.header} ${item.footer}
          </div>
        `.trim();
      } else if(item.icon_type == 'new_post') {
        block.innerHTML += `
          <div class="block">
            Лайк\n
            ${item.header} ${item.footer}
          </div>
        `.trim();
      } else if(item.icon_type == 'gift') {
        block.innerHTML += `
          <div class="block">
            Подарок\n
            ${item.header} ${item.footer}
          </div>
        `.trim();
      } else if(item.action.type == 'authorize') {
        block.innerHTML += `
          <div class="block">
            Авторизация\n
            ${item.header}
          </div>
        `.trim();
      } else if(item.icon_type == 'birthday') {
        block.innerHTML += `
          <div class="block">
            Авторизация\n
            ${item.header}
          </div>
        `.trim();
      } else if(item.id.split('_')[0] == 125) {
        block.innerHTML += `
          <div class="block">
            Новая версия приложения\n
            ${item.header} ${item.footer}
          </div>
        `.trim();
      } else if(item.icon_type == "friend_accepted") {
        block.innerHTML += `
          <div class="block">
            Принятие заявки в друзья\n
            ${item.header} ${item.footer}
          </div>
        `.trim();
      } else if(item.icon_type == "invite_group_accepted") {
        block.innerHTML += `
          <div class="block">
            Принятие заявки в сообщество\n
            ${item.header} ${item.footer}
          </div>
        `.trim();
      } else if(item.icon_type == "repost") {
        block.innerHTML += `
          <div class="block">
            Кто-то поделился вашей записью\n
            ${item.header} ${item.footer}
          </div>
        `.trim();
      } else if(item.icon_type == "transfer_money") {
        block.innerHTML += `
          <div class="block">
            Деньги\n
            ${item.header} ${item.footer}
          </div>
        `.trim();
      } else if(item.icon_type == 'wall') {
        block.innerHTML += `
          <div class="block">
            Запись на стене\n
            ${item.header} ${item.footer}
          </div>
        `.trim();
      } else if(item.id.split('_')[0] == 42) {
        block.innerHTML += `
          <div class="block">
            Голоса\n
            ${item.header} ${item.footer}
          </div>
        `.trim();
      } else {
        console.log(item);
      }
    }
    
    nots_list.innerHTML += block.innerHTML.replace(/\n/g, '<br>');
    
    loadNewNotifications();
  }, 'notifications_item_err');
}

var loadNewNotifications = () => {
  content.addEventListener('scroll', renderNewItems);

  let h = window.screen.height > nots_list.clientHeight;

  if(h || nots_list.clientHeight - window.outerHeight < window.scrollY) renderNewItems();
}

var renderNewItems = () => {
  let h = window.screen.height > nots_list.clientHeight,
      l = nots_list.clientHeight - window.outerHeight - 100 < content.scrollTop,
      a = nots_list.parentNode.classList.contains('content_active');

  if(a && (h || l)) {
    content.removeEventListener('scroll', renderNewItems);
    getNotifications();
  }
}

module.exports = {
  load
}
