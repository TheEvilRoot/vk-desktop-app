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

// &#13; - вообще прямо пустота
// &#8195; - пробел
// для эмодзи создать див со стилями инпута и с contenteditable=true

const querystring = require('querystring');

var messages_list = qs('.messages_list'),
    mess_list = qs('.messages_list .block'),
    offset = 0;

var load = () => {
  utils.verifiedList(getDialogs);
}

var getDialogs = () => {
  vkapi.method('execute', {
    code: `
    var m=API.messages.getDialogs({count:20,offset:${offset}}),
        d=m.items@.message@.user_id,i=0,u=[],g=[];
    while (i<d.length){if(d[i]>0){u.push(d[i]);}else{g.push(d[i]*-1);}i=i+1;}
    if(u.length){u=API.users.get({user_ids:u,fields:"verified,photo_50"});}
    if(g.length){g=API.groups.getById({group_ids:g,fields:"verified,photo_50"});}
    return {m:m,u:u,g:g};`
  }, data => {
    let block = { innerHTML: '' };
    
    data.response.p = data.response.u;
    
    for(let i=0; i<data.response.g.length; i++) {
      data.response.g[i].id = -data.response.g[i].id;
      
      data.response.p.push(data.response.g[i]);
    }
    
    delete data.response.u;
    delete data.response.g;
    
    if(!data.response.m.items.length) {
      if(offset) qs('.messages_list_err').remove();
      else qs('.messages_item_err').innerHTML = 'Список диалогов пуст.';
      
      return;
    }
    
    if(!offset) messages_list.style.display = 'block';
    
    for(let i=0; i<data.response.m.items.length; i++) {
      let item = data.response.m.items[i],
          user = data.response.p.find(f => f.id == item.message.user_id),
          name = item.message.title 
                ? item.message.title
                : user.name
                    ? user.name
                    : `${user.first_name} ${user.last_name}`,
          colors = ['fa50a5', 'c858dc', '6580f0', '59a9eb', '5fbf64', 'f8ca40', 'ffa21e', 'f04a48'],
          j = utils.r(0, colors.length-1), ph,
          text = item.message.body;
          
      if(!text) {
        if(item.message.attachments) text = 'Вложение';
        else if(false) return;
      }
      
      if(item.message.chat_id) {
        ph = item.message.photo_50 
              ? `<img class="dialog_photo" src="${item.message.photo_50}">`
              : `<div class="dialog_photo" style="background-color: #${colors[j]};">${name[0]}</div>`;
      } else {
        ph = `<img class="dialog_photo" src="${user.photo_50}">`;
      }
      
      block.innerHTML += `
        <div class='dialog'>
          ${ph}
          <div class="dialog_name">${name}</div>
          ${text}
        </div>
      `.trim();
    }
    
    mess_list.innerHTML += block.innerHTML;
    offset += data.response.m.items.length;
    
    loadNewDialogs();
  }, 'messages_item_err');
}

var loadNewDialogs = () => {
  content.addEventListener('scroll', renderNewItems);

  let h = window.screen.height > messages_list.clientHeight;

  if(h || messages_list.clientHeight - window.outerHeight < window.scrollY) renderNewItems();
}

var renderNewItems = () => {
  let h = window.screen.height > messages_list.clientHeight,
      l = messages_list.clientHeight - window.outerHeight - 100 < content.scrollTop,
      a = messages_list.parentNode.classList.contains('content_active');

  if(a && (h || l)) {
    content.removeEventListener('scroll', renderNewItems);
    getMessages();
  }
}

var getMessages = () => {
  getDialogs();
  
  // loadNewMessages();
}

var updateLongPoll = params => {
  let options = {
    act: 'a_check',
    wait: 25,
    mode: 234,
    key: params.key,
    ts: params.ts,
    version: 3
  }

  utils.request(`https://${params.server}?${querystring.stringify(options)}`, res => {
    let body = Buffer.alloc(0);

    res.on('data', ch => body = Buffer.concat([body, ch]));
    res.on('end', () => {
      body = JSON.parse(body);
      
      updateLongPoll(Object.assign(params, body));
      
      useLongPoll(body.updates);
    });
  });
};

var useLongPoll = data => {
  for(let i=0; i<(data || []).length; i++) {
    // [2, mess_id, flag, peer_id]
    // [3, mess_id, flag, peer_id]
    // console.log(data[i]);
  }
}

module.exports = {
  load,
  updateLongPoll
}
