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
const { request } = utils;

var news_content = qs('.news_content'),
    content = qs('.content'),
    start_from = '';

var load = () => {
  request({
    host: 'raw.githubusercontent.com',
    path: '/danyadev/data/master/develop'
  }, res => {
    let ver_list = Buffer.alloc(0);

    res.on('data', ch => ver_list = Buffer.concat([ver_list, ch]));
    res.on('end', () => {
      danyadev.verified = JSON.parse(ver_list);
      getNews();
    });
  }, 'news_inet_err');
}

// ads filters: friends_recomm,ads_app,ads_site,ads_post,ads_app_slider
// all filters: post,photo,photo_tag,wall_photo,friend,note,audio,video

var getNews = () => {
  vkapi.method('execute.getNewsfeedSmart', {
    count: 15,
    func_v: 5,
    start_from: start_from,
    filters: 'post,photo',
    fields: 'id,verified,first_name,first_name_dat,first_name_acc,last_name,last_name_acc,last_name_gen,sex,screen_name,photo_50,photo_100,online,video_files'
  }, data => {
    if (!data.response.next_from) {
      qs('.news_content_err').style.display = '';
      qs('.news_inet_err').innerHTML = `Показаны последние новости`;

      return;
    }

      qs('.news_inet_err').innerHTML = 'Загрузка...';

    start_from = data.response.next_from;

    for (let i = 0; i < data.response.items.length; i++) {
      let item = data.response.items[i],
          verified = '', sign = '', head_data,
          head_name, text = '', head_update = '',
          post_comments = { innerHTML: '' },
          time = new Date(item.date * 1000),
          this_time = new Date,
          parsed_time = '', like_style = '',
          zero = time.getMinutes() < 10 ? '0' : '',
          mins = zero + time.getMinutes(),
          months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
          ];

      if (item.caption && item.caption.type == "explorebait") continue;

      if (this_time.toLocaleDateString() == time.toLocaleDateString()) {
        parsed_time += 'Сегодня в ';
      } else if (this_time.getFullYear() == time.getFullYear()) {
        parsed_time += `${time.getDate()} ${months[time.getMonth()]} в `;
      } else {
        parsed_time += `${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()} в `;
      }

      parsed_time += `${time.getHours()}:${mins}`;

      if (item.source_id.toString()[0] == '-') {
        item.source_id = item.source_id.toString().replace(/-/, '');
        head_data = data.response.groups.find(el => el.id == item.source_id);
        head_name = head_data.name;

        if(head_data.verified || danyadev.verified[1].includes(head_data.id)) {
          verified = '<img class="friend_verify" src="images/verify.png">';
        }
      } else {
        head_data = data.response.profiles.find(el => el.id == item.source_id);
        head_name = `${head_data.first_name} ${head_data.last_name}`;

        if(head_data.verified || danyadev.verified[0].includes(head_data.id)) {
          verified = '<img class="friend_verify" src="images/verify.png">';
        }
      }

      if(item.type == 'post') {
        text = item.text;

        if(item.copy_history) {
          if(text) text += '\n';
          text += '*репост*';
        }

        if(item.post_source.data == 'profile_photo') {
          head_update = ` <span class='post_time'>
                        обновил${head_data.sex == 1 ? 'a' : ''}
                        фотографию на странице:</span>`;
        }

        if(item.final_post && !text) {
          head_update = ` <span class='post_time'>
                        молча удалил${head_data.sex == 1 ? 'a' : ''}
                        свою страницу.</span>`;
        } else if(item.final_post) {
          head_update = ` <span class='post_time'>
                        удалил${head_data.sex == 1 ? 'a' : ''}
                        свою страницу со словами:</span>`;
        }

        if (item.attachments) {
          if(text) text += '\n';

          for (let j = 0; j < item.attachments.length; j++) {
            let attach = item.attachments[j];

            if (attach.type == 'photo') {
              text += `<img src="${attach.photo.photo_604}" class="post_img">`;
            } else if(attach.type == 'audio') {
              text += '*Аудиозапись*';
            } else if(attach.type == 'article') {
              text += '*Статья*';
            } else if(attach.type == 'poll') {
              text += '*Голосование*';
            } else if(attach.type == 'video') {
              text += '*Видеозапись*';
            } else if(attach.type == 'doc') {
              text += '*Документ*';
            } else if(attach.type == 'link') {
              text += '*Ссылка*';
            } else {
              text += `Неизвестный тип прикрепления.\n
                       Скиньте текст ниже
                       <div data-url='https://vk.com/danyadev' class='link'
                            onclick='utils.openLink(this)'>разработчику</div>:\n
                       ${JSON.stringify(attach)}
                      `;
            }

            if(j != item.attachments.length-1) text += '\n';
          }
        }
      } else if(item.type == 'photo') {
        head_update = ` <span class='post_time'>
                      добавил${head_data.sex == 1 ? 'a' : ''}
                      новую фотографию</span>`;

        for(let j=0; j<item.photos.count; j++) {
          let photo = item.photos.items[j];

          text += `<img src="${photo.photo_604}" class="post_img">`;
        }
      }

      if (emoji.isEmoji(text)) text = emoji.replace(text);

      if (item.signer_id) {
        let signer = data.response.profiles.find(el => el.id == item.signer_id);

        sign = `<br><div class='post_signer'>${signer.first_name} ${signer.last_name}</div>`;
      }

      text = text.replace(/\n/g, '<br>');

      if(!item.likes.user_likes) like_style = 'style="opacity: 0.35"';

      if(item.comments.can_post) {
        post_comments.innerHTML = `
        <div class="post_comments">
          <img src="images/comment.svg" class="post_comment_img">
          <div class="post_comment_text">Комментировать</div>
          <div class="post_comment_count">${item.comments.count || ''}</div>
        </div>
        `;
      }

      news_content.innerHTML += `
        <div class='news_block theme_block'>
          <div class='post_header'>
            <img src="${head_data.photo_50}" class="post_header_img">
            <div class="post_names">
              <div class="post_name">${head_name} ${verified} ${head_update}</div>
              <div class="post_time">${parsed_time}</div>
            </div>
          </div>
          <div class="post_content">${text} ${sign}</div>
          <div class="post_bottom">
            <div class="post_like">
              <img src="images/like.svg" class="post_like_img" ${like_style}>
              <div class="post_like_text">Нравится</div>
              <div class="post_like_count">${item.likes.count || ''}</div>
            </div>
            ${post_comments.innerHTML}
          </div>
        </div>
      `.trim();
    }

    loadNewNews();
  }, 'news_inet_err');
}

var loadNewNews = start_from => {
  content.addEventListener('scroll', renderNewItems);

  let h = window.screen.height > news_content.clientHeight;

  if (h || news_content.clientHeight - window.outerHeight < window.scrollY) renderNewItems();
}

var renderNewItems = () => {
  let h = window.screen.height > news_content.clientHeight,
      l = news_content.clientHeight - window.outerHeight < content.scrollTop,
      a = qs('.news_content').parentNode.classList.contains('content_active');

  if (a && (h || l)) {
    content.removeEventListener('scroll', renderNewItems);
    getNews();
  }
}

// if(item.type == 'friend') {
//   let creator = data.response.profiles.find(el => el.id == item.source_id);
//
//   text += `${creator.first_name} ${creator.last_name} добавил${creator.sex == 1 ? 'a' : ''} в друзья `;
//
//   item.friends.items.forEach((item_, i) => {
//     let user = data.response.profiles.find(el => el.id == item_.user_id);
//     text += `${user.first_name_acc} ${user.last_name_acc}`;
//
//     if(i == item.friends.items.length-1) text += '.';
//     else text += ', ';
//   })

module.exports = {
  load, getNews
}
