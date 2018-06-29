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

const { dialog } = require('electron').remote;

var settings_tabs = qs('.settings_tabs'),
    settings_content_block = qs('.settings_content_block'),
    settings_main = qs('.settings_main');

settings_tabs.children[0].classList.add('settings_tab_active');
settings_content_block.children[0].classList.add('settings_content_active');

[].slice.call(settings_tabs.children).forEach(item => {
  item.addEventListener('click', function() {
    if(qs('.settings_tab_active') == this) return;
    let tab = [].slice.call(settings_tabs.children).indexOf(this);

    qs('.settings_tab_active').classList.remove('settings_tab_active');
    qs('.settings_content_active').classList.remove('settings_content_active');

    settings_tabs.children[tab].classList.add('settings_tab_active');
    settings_content_block.children[tab].classList.add('settings_content_active');
  });
});

var initSelect = (sel, init, change) => {
  let select = qs(sel),
      list = select.children[1],
      selected = select.children[0].children[1];

  init(sel, list, selected);

  select.addEventListener('click', () => {
    if(qs(`${sel}.select_opened`)) {
      select.classList.remove('select_opened');
    } else {
      select.classList.add('select_opened');

      let closeSelect = () => {
        let sel_ = sel.replace(/\./, '');

        if(!(!event.path[1].classList.contains(`${sel_}`) && event.path[2].classList.contains(`${sel_}`)) &&
           !(event.path[1].classList.contains(`${sel_}`) && !event.path[2].classList.contains(`${sel_}`))) {
          select.classList.remove('select_opened');
          document.body.removeEventListener('click', closeSelect);
        }
      }

      document.body.addEventListener('click', closeSelect);
    }
  });

  list.addEventListener('mousemove', () => {
    qs(`${sel} .active`).classList.remove('active');

    event.target.classList.add('active');
  });

  list.addEventListener('click', () => {
    selected.innerHTML = event.target.innerHTML;

    change(event, list);
  });
}

var load = () => {
  // загружать html
}

settings_main.style.display = 'none';

vkapi.method('account.getProfileInfo', null).then(data => {
  settings_main.style.display = '';
  qs('.settings_block_err').style.display = 'none';

  qs('.settings_nick').value = data.response.screen_name || `id${danyadev.user.id}`;
  
  if(settings.update) qs('.check_updates').classList.add('on');
  if(settings.update && settings.branch == 'dev') qs('.get_beta_versions').classList.add('on');
  if(settings.notify_updates) qs('.notify_updates').classList.add('on');
}, 'settings_main_err');

qs('.custom_input').addEventListener('click', () => {
  qs('.custom_input_input').focus();
});

qs('.check_updates').addEventListener('click', () => {
  if(qs('.check_updates').classList.contains('on')) {
    settings.update = false;
    qs('.get_beta_versions').classList.remove('on');
  } else {
    settings.update = true;
    
    if(settings.branch == 'dev') {
      qs('.get_beta_versions').classList.add('on');
    }
  }
  
  settings.save();
  qs('.check_updates').classList.toggle('on');
});

qs('.get_beta_versions').addEventListener('click', () => {
  if(qs('.get_beta_versions').classList.contains('on')) {
    settings.branch = 'master';
  } else {
    settings.branch = 'dev';
    
    if(!qs('.check_updates').classList.contains('on')) {
      qs('.check_updates').classList.add('on');
    }
  }
  
  settings.save();
  qs('.get_beta_versions').classList.toggle('on');
});

qs('.notify_updates').addEventListener('click', () => {
  if(qs('.notify_updates').classList.contains('on')) {
    settings.notify_updates = false;
  } else {
    settings.notify_updates = true;
  }
  
  settings.save();
  qs('.notify_updates').classList.toggle('on');
});

qs('.logout').addEventListener('click', () => {
  dialog.showMessageBox({
    type: 'info',
    buttons: ['ОК', 'Отмена'],
    title: 'Выход',
    message: 'Вы действительно хотите выйти?',
    detail: 'Будет открыта форма входа',
    noLink: true
  }, btn => {
    if(!btn) {
      settings.theme = 'white';
      settings.def_tab = 0;
      settings.save();
      
      users.list.splice(users.list.indexOf(danyadev.user), 1);
      users.save();

      getCurrentWindow().reload();
    }
  });
});

// отключить пункт меню = сделать его display: none;

initSelect('.change_theme', (sel, list, selected) => {
  let optionBlock = '',
      themeList = require('fs').readdirSync(`${utils.app_path}/renderer/themes`)
                               .map(item => item.replace(/\.css/, ''));

  themeList.unshift('white');

  let themeID = themeList.indexOf(settings.theme);

  for(let i=0; i<themeList.length; i++) {
    optionBlock += `<div class="option theme_block">${themeList[i]}</div>`
  }

  list.innerHTML = optionBlock;
  selected.innerHTML = settings.theme;

  list.children[themeID].classList.add('active');
}, event => {
  settings.theme = event.target.innerHTML;
  settings.save();
  theme(event.target.innerHTML);
});

initSelect('.change_def_tab', (sel, list, selected) => {
  let menu_list = [
    'Моя страница', 'Новости',
    'Сообщения', 'Аудиозаписи',
    'Уведомления', 'Друзья',
    'Группы', 'Фотографии',
    'Видеозаписи', 'Настройки'
  ], optionBlock = '',
     defTabID = settings.def_tab;

  for(let i=0; i<menu_list.length; i++) {
    optionBlock += `<div class="option theme_block">${menu_list[i]}</div>`
  }

  list.innerHTML = optionBlock;
  selected.innerHTML = menu_list[defTabID];

  list.children[defTabID].classList.add('active');
}, (event, list) => {
  settings.def_tab = [].slice.call(list.children).indexOf(event.target);
  settings.save();
});

module.exports = {
  load
}
