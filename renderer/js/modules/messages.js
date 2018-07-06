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
  utils.verifiedList()
    .then(() => getDialogs());
}

var getDialogs = () => {
  
}

var loadNewDialogs = () => {
  content.addEventListener('scroll', renderNewItems);

  let h = window.screen.height > messages_list.clientHeight;

  if(h || messages_list.clientHeight - window.outerHeight < window.scrollY) renderNewItems();
}

var renderNewItems = () => {
  let h = window.screen.height > messages_list.clientHeight,
      l = messages_list.clientHeight - window.outerHeight < content.scrollTop,
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
