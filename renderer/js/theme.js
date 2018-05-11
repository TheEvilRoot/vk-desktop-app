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

var settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')).settings;

module.exports = type => {
  let attrs = [].slice.call(qs('body').classList);
  
  if((type && type == 'white') || (!type && settings.theme == 'white')) {
    if(attrs.length > 0) qs('body').classList.remove(attrs[0]);
    return;
  }
  
  if(type) {
    if(attrs.length > 0) {
      if(type == attrs[0]) return;
      
      qs('body').classList.remove(attrs[0]);
    }
    
    qs('body').classList.add(type + '_theme');
  } else {
    qs('body').classList.add(settings.theme + '_theme');
  }
}
