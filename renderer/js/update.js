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

const https = require('https');
const fs = require('fs');
const path = require('path');
const { dialog, app } = require('electron').remote;
const { app_path } = utils;

const auth = 'client_id=2cca2222a6f211d96eb5&client_secret=7ca0d642c52d3c5c4d793782993da8691152a8f3';

var check = async () => {
  if(!settings.update) return;
  
  let branch = settings.beta ? 'dev' : 'master',
      ext_pkg = JSON.parse(await utils.request(`https://raw.githubusercontent.com/danyadev/vk-desktop-app/${branch}/package.json`)),
      loc_pkg = require('./../../package.json');
      
  let data = JSON.parse(await utils.request({
    host: 'api.github.com',
    path: `/repos/danyadev/vk-desktop-app/branches/dev?${auth}`,
    headers: {
      'User-Agent': 'VK Desktop'
    }
  }));
  
  let commitDate = new Date(data.commit.commit.committer.date).getTime(),
      normDate = commitDate < new Date().getTime() - 1000 * 60 * 5,
      newVer = ext_pkg.version > loc_pkg.version || (settings.beta && data.commit.sha != settings.sha);
  
  if(!normDate || !newVer) return;
  
  let changelog = await utils.request(`https://raw.githubusercontent.com/danyadev/vk-desktop-app/${branch}/changelog.txt`),
      versions = {}, changes = '', num = 0;
      
  changelog.split('\n\n').forEach(version => {
    let v = version.match(/Версия ([^:]+)/)[1];
    
    versions[v] = version.replace(/[^\n]+\n/, '');
    
    if(v > loc_pkg.version) {
      changes += '\n' + versions[v];
    }
  });
  
  let lastV = Object.keys(versions)[0],
      update_item = document.createElement('div');
  
  update_item.classList.add('menu_item');
  update_item.classList.add('update_item');
  update_item.innerHTML = `<div class="menu_item_name">Обновить приложение</div>`;
  qs('.menu').appendChild(update_item);
  qs('.menu_list').style.height = 'calc(100vh - 125px - 44px)';
  
  update_item.addEventListener('click', () => {
    toggleMenu();
    update_item.remove();
    update();
    qs('.menu_list').style.height = 'calc(100vh - 125px)';
  });
  
  clearTimeout(updateTimer);
  
  danyadev.sha = data.commit.sha;
  changes = changes.replace(/\n[\d]+\./g, () => `\n${++num}.`);
  
  if(!settings.notify_updates) return;
  
  dialog.showMessageBox({
    type: 'info',
    buttons: ['Отмена', 'ОК'],
    title: `Новая версия ${lastV}`,
    message: `Доступна новая версия ${lastV}`,
    detail: `Список изменений:\n${changes}\n\nОбновиться до версии ${lastV}?`,
    checkboxLabel: 'Больше не показывать',
    noLink: true
  }, (ok, noNotify) => {
    if(noNotify) {
      settings.notify_updates = false;
      qs('.notify_updates').classList.remove('on')
      settings.save();
    }
    
    if(ok) {
      update_item.remove();
      update();
      qs('.menu_list').style.height = 'calc(100vh - 125px)';
    }
  });
}

var update = async () => {
  let githubFiles = await getGithubFiles(),
      localFiles = await getLocalFiles(),
      deleteFiles = localFiles.filter(file => !githubFiles.includes(file));
  
  let updateFile = i => {
    if(!githubFiles[i]) {
      deleteFiles.forEach(file => fs.unlinkSync(file));
      
      dialog.showMessageBox({
        type: 'info',
        buttons: ['Отмена', 'ОК'],
        title: 'Обновление завершено',
        message: 'Обновление завершено',
        detail: 'Для обновления необходимо перезагрузить приложение.\nПродолжить?',
        noLink: true
      }, ok => {
        if(ok) {
          app.relaunch();
          app.exit();
        }
      });
      
      settings.sha = danyadev.sha;
      settings.save();
      
      return;
    }
    
    let filename = githubFiles[i],
        githubFile = filename.replace(app_path, '');
        
    if(!fs.existsSync(filename)) {
      mkdirP(filename.replace(/[^/]+$/, ''));
    }
    
    https.get({
      host: 'raw.githubusercontent.com',
      path: `/danyadev/vk-desktop-app/${settings.beta ? 'dev' : 'master'}${encodeURIComponent(githubFile)}`
    }, res => {
      res.pipe(fs.createWriteStream(filename));
      res.on('end', () => updateFile(++i));
    });
  }
  
  updateFile(0);
}

var getGithubFiles = () => {
  return new Promise((resolve, reject) => {
    let fileList = [], dirCount = 0, dirs = 0;

    let sendReq = async path => {
      let data = JSON.parse(await utils.request({
        host: 'api.github.com',
        path: `/repos/danyadev/vk-desktop-app/contents/${path}?${auth}&ref=${settings.beta ? 'dev' : 'master'}`,
        headers: { 'User-Agent': 'VK Desktop' }
      }));

      dirs++;

      for(let i = 0; i < data.length; i++) {
        if(data[i].type == 'dir') sendReq(`${path}/${data[i].name}`);
        else fileList.push(`${app_path}${path}/${data[i].name}`);

        if(i == data.length-1) {
          data.forEach(file => {
            if(file.type == 'dir') dirCount++;
          });

          if(dirs > dirCount) resolve(fileList);
        }
      }
    }

    sendReq('');
  });
}

var getLocalFiles = () => {
  return new Promise((resolve, reject) => {
    let getFiles = (dir, files_) => { 
      files_ = files_ || [];

      let files = fs.readdirSync(dir);

      for(let i in files) {
        let name = `${dir}/${files[i]}`;
        
        if(['.git', 'core', 'node_modules'].includes(files[i])) continue;

        if(fs.statSync(name).isDirectory()) {
          getFiles(name, files_);
        } else files_.push(name.replace(/\\/g, '/'));
      }

      resolve(files_);
    }

    getFiles(app_path);
  });
}

var mkdirP = p => {
  p = path.resolve(p);

  try {
    fs.mkdirSync(p);
  } catch(err) {
    if(err.code == 'ENOENT') {
      mkdirP(path.dirname(p));
      mkdirP(p);
    }
  }
}

module.exports = {
  check
}
