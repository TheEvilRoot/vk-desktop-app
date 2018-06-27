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

var nots_list = qs('.notifications_list');

var load = () => {
  utils.verifiedList('notifications_item_err')
    .then(() => getNotifications());
}

var getNotifications = () => {
  
}

var loadNewNotifications = () => {
  content.addEventListener('scroll', renderNewItems);

  let h = window.screen.height > nots_list.clientHeight,
      l = nots_list.clientHeight - window.outerHeight < window.scrollY;

  if(h || l) renderNewItems();
}

var renderNewItems = () => {
  let a = nots_list.parentNode.classList.contains('content_active'),
      h = window.screen.height > nots_list.clientHeight,
      l = nots_list.clientHeight - window.outerHeight < content.scrollTop;

  if(a && (h || l)) {
    content.removeEventListener('scroll', renderNewItems);
    getNotifications();
  }
}

module.exports = {
  load
}
