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

var group_list = qs('.group_list'),
    content = qs('.content');

danyadev.groups = {};

danyadev.groups.count = 0;
danyadev.groups.loaded = 0;
danyadev.groups.list = [];

var load = () => {
  utils.verifiedList(getAllGroups, 'group_item_err');
}

var pad = (n, tx) => {
  n = Math.abs(n) % 100;

  let n1 = n % 10;

  if(n > 10 && n < 20) return tx[2];
  if(n1 > 1 && n1 < 5) return tx[1];
  if(n1 == 1) return tx[0];

  return tx[2];
}

var getAllGroups = offset => {
  offset = offset || 0;
  
  vkapi.method('groups.get', {
    extended: true,
    fields: 'members_count,activity,verified',
    offset: offset
  }, data => {
    danyadev.groups.count = data.response.count;
    danyadev.groups.list = danyadev.groups.list.concat(data.response.items);

    if(danyadev.groups.list.length < data.response.count) {
      getAllGroups(offset + 1000);
    } else {
      if(!data.response.count) {
        qs('.group_item_err').innerHTML = 'Вы не состоите ни в одной группе.'
      } else render();
    }
  }, 'group_item_err');
}

var render = () => {
  let block = { innerHTML: '' },
      endID = danyadev.groups.loaded + 15;

  let renderItem = () => {
    let item = danyadev.groups.list[danyadev.groups.loaded],
        members = 'подписчик' + pad(item.members_count, ['', 'а', 'ов']),
        name, verify = '',
        _v = utils.checkVerify(item.verified, item.id);

    if(item.deactivated) {
      name = '<div class="group_type">Сообщество заблокировано</div>';
    } else if(!item.members_count) {
      name = `
        <div class="group_type">${item.activity}</div><br>
        <div class="group_subs">Сообщество заблокировано</div>
      `.trim();
    } else {
        name = `
          <div class="group_type">${item.activity}</div><br>
          <div class="group_subs">${item.members_count.toLocaleString('ru-RU')} ${members}</div>
      `.trim();
    }

    if(_v[0]) {
      verify = `<img class="img_verified" src="images/verified_${_v[1]}.svg">`;
    }

    block.innerHTML += `
      <div class="block mini">
        <img src="${item.photo_100}" class="group_img">
        <div class="group_names">
          <div class="group_name">${item.name} ${verify}</div><br>
          ${name}
        </div>
      </div>
    `;

    danyadev.groups.loaded++;

    if(danyadev.groups.list[danyadev.groups.loaded] && danyadev.groups.loaded < endID) {
      setTimeout(renderItem, 0);
    } else {
      group_list.innerHTML += block.innerHTML;

      if(danyadev.groups.loaded < danyadev.groups.count) loadGroupsBlock();
      else qs('.group_list_err').remove();
    }
  }

  renderItem();
}

var renderNewItems = () => {
  let h = window.screen.height > group_list.clientHeight,
      l = group_list.clientHeight - window.outerHeight - 100 < content.scrollTop,
      a = group_list.parentNode.classList.contains('content_active');

  if(a && (h || l)) {
    content.removeEventListener('scroll', renderNewItems);
    render();
  }
}

var loadGroupsBlock = () => {
  content.addEventListener('scroll', renderNewItems);

  let h = window.screen.height > group_list.clientHeight,
      l = group_list.clientHeight - window.outerHeight - 100 < content.scrollTop;

  if(h || l) renderNewItems();
}

module.exports = {
  load
}
