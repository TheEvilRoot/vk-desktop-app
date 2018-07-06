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

const emoji = require('./emoji');

var news_list = qs('.news_list'),
    content = qs('.content'),
    start_from = '';

var load = () => {
  utils.verifiedList('news_item_err')
    .then(() => getNews());
}

// ads filters: friends_recomm,ads_app,ads_site,ads_post,ads_app_slider
// all filters: post,photo,photo_tag,wall_photo,friend,note,audio,video

var getNews = () => {
  if(start_from == undefined) {
    qs('.news_list_err').style.display = '';
    qs('.news_item_err').innerHTML = 'Показаны последние новости';

    return;
  }
  
  vkapi.method('newsfeed.get', {
    count: 15,
    start_from: start_from,
    filters: 'post,photo',
    fields: 'verified,sex,screen_name,photo_50,video_files'
  }, 'news_item_err').then(data => {    
    start_from = data.response.next_from;
    
    for(let i = 0; i < data.response.items.length; i++) {
      let item = data.response.items[i],
          head_data, parsed_time,
          head_name, text = '',
          isGroup = false,
          post_comments = { innerHTML: '' },
          time = new Date(item.date * 1000),
          this_time = new Date, head_type = '',
          zero = time.getMinutes() < 10 ? '0' : '',
          mins = zero + time.getMinutes(),
          months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
          ];

      if(item.caption && item.caption.type == 'explorebait') continue;

      if(this_time.toLocaleDateString() == time.toLocaleDateString()) {
        parsed_time = 'Сегодня';
      } else if(this_time.getFullYear() == time.getFullYear()) {
        parsed_time = `${time.getDate()} ${months[time.getMonth()]}`;
      } else {
        parsed_time = `${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}`;
      }

      parsed_time += ` в ${time.getHours()}:${mins}`;

      if(item.source_id.toString()[0] == '-') {
        item.source_id = Math.abs(item.source_id);
        
        isGroup = true;
        
        head_data = data.response.groups.find(el => el.id == item.source_id);
        head_name = head_data.name;
      } else {
        head_data = data.response.profiles.find(el => el.id == item.source_id);
        head_name = `${head_data.first_name} ${head_data.last_name}`;
      }
      
      let _v = utils.checkVerify(head_data.verified, isGroup ? -head_data.id : head_data.id),
          sex = head_data.sex == 1 ? 'a' : '';

      if(_v[0]) {
        head_name += `<img class="img_verified" src="images/verified_${_v[1]}.svg">`;
      }

      if(item.type == 'post') {
        text += item.text;
        
        text = text.replace(/([-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?)/gi,
                           '<div class="link" onclick="utils.openLink(\'$1\')">$1</div>')
                   .replace(/\[(\w+)\|([^[]+)\]/g,
                           '<div class="link" onclick="utils.openLink(\'https://vk.com/$1\')">$2</div>')
                   .replace(/#([^# \n]+)/g,
                           '<div class="link" onclick="utils.openLink(\'https://vk.com/feed?section=search&q=$1\')">#$1</div>');

        if(item.copy_history) {
          if(text) text += '\n';
          
          text += '*репост*';
        }

        if(item.post_source.data == 'profile_photo') {
          head_type = ` <span class='post_type'>обновил${sex} фотографию на странице</span>`;
        } else if(item.final_post && !text) {
          head_type = ` <span class='post_time'>молча удалил${sex} свою страницу</span>`;
        } else if(item.final_post) {
          head_type = ` <span class='post_time'>удалил${sex} свою страницу со словами</span>`;
        }

        if(item.attachments) {
          if(text) text += '\n\n';

          for(let j = 0; j < item.attachments.length; j++) {
            let attach = item.attachments[j];

            if(attach.type == 'photo') {
              let ph = attach.photo.sizes.find(s => s.type == 'x');
              text += `<img src="${ph.url}" class="post_img">`;
            } else if(attach.type == 'audio') {
              text += '*Аудиозапись*';
            } else if(attach.type == 'article') {
              text += '*Статья*';
            } else if(attach.type == 'poll') {
              console.log(attach.poll);
              
              text += '*Голосование*';
            } else if(attach.type == 'video') {
              text += '*Видеозапись*';
            } else if(attach.type == 'doc') {
              text += '*Документ*';
            } else if(attach.type == 'link') {
              text += '*Ссылка*';
            } else if(attach.type == 'note') {
              text += '*Заметка*';
            } else if(attach.type == 'audio_playlist') {
              text += '*Плейлист*';
            } else if(attach.type == 'album') {
              text += '*Фотоальбом*';
            } else if (attach.type == 'page') {
              text += '*Вики-страница*';
            } else {
              text += `Неизвестный тип прикрепления.\n
                Скиньте текст ниже <div class='link' onclick='utils.openLink("https://vk.com/danyadev")'>разработчику</div>:\n
                ${JSON.stringify(attach)}
              `;
            }

            if(j != item.attachments.length-1) text += '\n';
          }
        }
      } else if(item.type == 'photo') {
        let l = item.photos.items.length == 1 ? 'новую фотографию' : 'новые фотографии';
        
        head_type = ` <span class='post_type'>добавил${sex} ${l}</span>`;

        for(let j=0; j<item.photos.items.length; j++) {
          let photo = item.photos.items[j],
              ph = photo.sizes.find(s => s.type == 'x');
          
          text += `<img src="${ph.url}" class="post_img">`;
        }
      }

      if(emoji.isEmoji(text)) text = emoji.replace(text);
      
      text = text.replace(/\n/g, '<br>');
      
      if(item.geo) {
        let l = `https://maps.yandex.ru/?text=${item.geo.coordinates.replace(/ /, ',')}`;
        
        text += `
        <br><div class="post_geo link" onclick="utils.openLink('${l}')">${item.geo.place.title}</div>
        `.trim();
      }

      if(item.signer_id) {
        let signer = data.response.profiles.find(el => el.id == item.signer_id);

        text += `
        <br>
        <div class='post_signer link' onclick="utils.openLink('https://vk.com/${signer.screen_name}')">
          ${signer.first_name} ${signer.last_name}
        </div>
        `.trim();
      }
      
      let post_bottom = '';
      
      if(item.type != 'photo') {
        let likes = item.likes.count || '',
            comments = item.comments.count || '',
            reposts = item.reposts.count || '',
            views = item.views && item.views.count || 0;
            
        
        var reduceNum = num => {
          let rn = null;
          
          if(num >= 1000) {
            if(num >= 1000000) rn = (num / 1000000).toFixed(1) + 'M';
            else rn = (num / 1000).toFixed(1) + 'K';
          }
          
          return rn || num;
        }
        
        likes = reduceNum(likes);
        comments = reduceNum(comments);
        reposts = reduceNum(reposts);
        views = reduceNum(views);
        
        let like_act_img   = '', like_act_cnt   = '',
            repost_act_img = '', repost_act_cnt = '';

        if(item.likes.user_likes) {
          like_act_img = 'post_btn_act_i';
          like_act_cnt = 'post_btn_act_c';
        }
        
        if(item.reposts.user_reposted) {
          repost_act_img = 'post_btn_act_i';
          repost_act_cnt = 'post_btn_act_c';
        }
        
        post_bottom = `
          <div class="post_bottom">
            <div class="post_like" onclick="require('./js/modules/news').like(${isGroup ? -head_data.id : head_data.id}, ${item.post_id}, this)">
              <img class="post_like_img ${like_act_img}">
              <div class="post_like_count ${like_act_cnt}">${likes}</div>
            </div>
            <div class="post_comment">
              <img class="post_comment_img">
              <div class="post_comment_count">${comments}</div>
            </div>
            <div class="post_repost">
              <img class="post_repost_img ${repost_act_img}">
              <div class="post_repost_count ${repost_act_cnt}">${reposts}</div>
            </div>
            <div class="post_views">
              <img class="post_views_img">
              <div class="post_views_count">${views}</div>
            </div>
          </div>
        `.trim();
      }

      news_list.innerHTML += `
        <div class='block'>
          <div class='post_header'>
            <img src="${head_data.photo_50}" class="post_header_img">
            <div class="post_names">
              <div class="post_name link" onclick="utils.openLink('https://vk.com/${head_data.screen_name}')">
                ${head_name}
              </div>
              ${head_type}<br>
              <div class="post_time">${parsed_time}</div>
            </div>
          </div>
          <div class="post_content">${text}</div>
          ${post_bottom}
        </div>
      `.trim();
    }
    
    if(!start_from) getNews();

    loadNewNews();
  });
}

var loadNewNews = () => {
  content.addEventListener('scroll', renderNewItems);

  let h = window.screen.height > news_list.clientHeight;

  if(h || news_list.clientHeight - window.outerHeight < window.scrollY) renderNewItems();
}

var renderNewItems = () => {
  let h = window.screen.height > news_list.clientHeight,
      l = news_list.clientHeight - window.outerHeight < content.scrollTop,
      a = news_list.parentNode.classList.contains('content_active');

  if(a && (h || l)) {
    content.removeEventListener('scroll', renderNewItems);
    getNews();
  }
}

var like = (oid, iid, target) => {
  if(!oid || !utils.isNumber(oid) || !iid || !utils.isNumber(iid)) return;
  
  vkapi.method('execute', {
    code: `
      var liked = API.likes.isLiked({ type: "post", item_id: ${iid}, owner_id: ${oid} }).liked,
          count = 0;
      
      if(liked) {
        count = API.likes.delete({ type: "post", item_id: ${iid}, owner_id: ${oid} });
      } else {
        count = API.likes.add({ type: "post", item_id: ${iid}, owner_id: ${oid} });
      }
      
      return { count: count.likes, remove: liked };
    `
  }).then(data => {
    if(target) {
      if(data.response.remove) {
        target.children[0].classList.remove('post_btn_act_i');
        target.children[1].classList.remove('post_btn_act_c');
      } else {
        target.children[0].classList.add('post_btn_act_i');
        target.children[1].classList.add('post_btn_act_c');
      }
      
      target.children[1].innerHTML = data.response.count || '';
    }
  });
}

module.exports = {
  load,
  getNews,
  like
}
