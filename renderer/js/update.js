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

qs('.update_item').addEventListener('click', () => {
  qs('.update_item').remove();
  update();
});

var check = async () => {
  if(!settings.update) return;
  
  let branch = settings.branch || 'master',
      isDev = branch == 'dev',
      ext_pkg = JSON.parse(await utils.request(`https://raw.githubusercontent.com/danyadev/vk-desktop-app/${branch}/package.json`)),
      loc_pkg = require('./../../package.json'),
      v0 = ext_pkg.version.split('.'), // с гитхаба
      v1 = loc_pkg.version.split('.'), // текущая
      thisVer = ext_pkg.version == loc_pkg.version,
      isNewVer = v0[0] > v1[0] || v0[1] > v1[1] || v0[2] > v1[2],
      isNewBuild = ext_pkg.build > loc_pkg.build;
      
  let data = JSON.parse(await utils.request({
    host: 'api.github.com',
    path: `/repos/danyadev/vk-desktop-app/branches/dev?${auth}`,
    headers: {
      'User-Agent': 'VK Desktop'
    }
  }));
  
  let commitDate = new Date(data.commit.commit.committer.date).getTime(),
      normDate = commitDate < new Date().getTime() - 1000 * 60 * 5,
      newVer = isNewVer || (thisVer && isNewBuild) || (isDev && data.commit.sha != settings.sha);
  
  if(!normDate || !newVer) return;
  
  let changelog = await utils.request(`https://raw.githubusercontent.com/danyadev/vk-desktop-app/${branch}/changelog.txt`),
      versions = {}, changes = '', num = 0;
      
  changelog.split('\n\n').forEach(version => {
    let v = version.match(/Версия ([^:]+)/)[1],
        v0 = v.split('.');
    
    versions[v] = version.replace(/[^\n]+\n/, '');
    
    if(v0[0] > v1[0] || v0[1] > v1[1] || v0[2] > v1[2]) {
      changes += '\n' + versions[v];
    }
  });
  
  let lastV = Object.keys(versions)[0];
  
  changes = changes.replace(/\n[\d]+\./g, () => `\n${++num}.`);
  
  clearTimeout(updateTimer);
  
  qs('.update_item').style.display = 'block';
  
  danyadev.sha = data.commit.sha;
  
  if(!settings.notify_updates) return;
  
  dialog.showMessageBox({
    type: 'info',
    buttons: ['ОК', 'Отмена'],
    title: `Новая версия ${lastV}`,
    message: `Доступна новая версия ${lastV}${isDev ? ' (бета)' : ''}`,
    detail: `Список изменений:\n${changes}\n\nОбновиться до версии ${lastV}?`,
    checkboxLabel: 'Больше не показывать',
    noLink: true
  }, (cancel, noNotify) => {
    if(noNotify) {
      settings.notify_updates = false;
      settings.save();
    }
    
    if(!cancel) {
      qs('.update_item').remove();
      update();
    }
  });
}

var update = async () => {
  let githubFiles = await getGithubFiles(),
      localFiles = await getLocalFiles(),
      deleteFiles = localFiles.filter(file => !githubFiles.includes(file));
  
  let updateFile = (i = 0) => {
    if(!githubFiles[i]) {
      deleteFiles.forEach(file => fs.unlinkSync(file));
      
      dialog.showMessageBox({
        type: 'info',
        buttons: ['ОК', 'Отмена'],
        title: 'Обновление завершено',
        message: 'Обновление завершено',
        detail: 'Для обновления необходимо перезагрузить приложение.\nПродолжить?',
        noLink: true
      }, btn => {
        if(!btn) {
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
      path: `/danyadev/vk-desktop-app/${settings.branch}${encodeURIComponent(githubFile)}`
    }, res => {
      res.pipe(fs.createWriteStream(filename));
      res.on('end', () => updateFile(++i));
    });
  }
  
  updateFile();
}

var getGithubFiles = () => {
  return new Promise((resolve, reject) => {
    let fileList = [], dirCount = 0, dirs = 0;

    let sendReq = async path => {
      let data = JSON.parse(await utils.request({
        host: 'api.github.com',
        path: `/repos/danyadev/vk-desktop-app/contents/${path}?${auth}&ref=${settings.branch}`,
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
