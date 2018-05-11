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

var group_wrap = qs('.group_wrap'),
    content = qs('.content');

danyadev.groups = {};

danyadev.groups.count = 0;
danyadev.groups.loaded = 0;
danyadev.groups.list = [];
danyadev.groups.verified = [];

var load = () => {
  // для чего-то
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
      } else {
        qs('.group_wrap_err').style.display = 'none';
        render();
      }
    }
  }, 'group_item_err');
}

request({
  host: 'raw.githubusercontent.com',
  path: '/danyadev/data/master/develop'
}, res => {
  let group_ver_list = Buffer.alloc(0);

  res.on('data', ch => group_ver_list = Buffer.concat([group_ver_list, ch]));
  res.on('end', () => {
    danyadev.groups.verified = JSON.parse(group_ver_list)[1];
    getAllGroups(0);
  });
});

var render = () => {
  let block = { innerHTML: '' },
      endID = danyadev.groups.loaded + 15;

  let renderItem = () => {
    let group = danyadev.groups.list[danyadev.groups.loaded],
        members = 'подписчик' + pad(group.members_count, ['', 'а', 'ов']),
        name, verify = '';

    if(group.deactivated) {
      name = '<div class="group_type">Сообщество заблокировано</div>';
    } else if(!group.members_count) {
      name = `
        <div class="group_type">${group.activity}</div>
        <div class="group_subs">Сообщество заблокировано</div>
      `.trim();
    } else {
        name = `
          <div class="group_type">${group.activity}</div>
          <div class="group_subs">${group.members_count.toLocaleString('ru-RU')} ${members}</div>
      `.trim();
    }

    if(group.verified || danyadev.groups.verified.includes(group.id)) {
      verify = '<img class="friend_verify" src="images/verify.png">';
    }

    block.innerHTML += `
      <div class="group_item theme_block">
        <img src="${group.photo_100}" class="group_img">
        <div class="group_names">
          <div class="group_name">${group.name} ${verify}</div>
          ${name}
        </div>
      </div>
    `;

    danyadev.groups.loaded++;

    if(danyadev.groups.list[danyadev.groups.loaded] && danyadev.groups.loaded < endID) {
      setTimeout(renderItem, 0);
    } else {
      group_wrap.innerHTML += block.innerHTML;

      if(danyadev.groups.loaded < danyadev.groups.count) loadGroupsBlock();
    }
  }

  renderItem();
}

var renderNewItems = () => {
  let h = window.screen.height > group_wrap.clientHeight,
      l = group_wrap.clientHeight - window.outerHeight - 100 < content.scrollTop,
      a = qs('.group_wrap').parentNode.classList.contains('content_active');

  if(a && (h || l)) {
    content.removeEventListener('scroll', renderNewItems);
    render();
  }
}

var loadGroupsBlock = () => {
  content.addEventListener('scroll', renderNewItems);

  let h = window.screen.height > group_wrap.clientHeight,
      l = group_wrap.clientHeight - window.outerHeight - 100 < content.scrollTop;

  if(h || l) renderNewItems();
}

module.exports = {
  load
}
