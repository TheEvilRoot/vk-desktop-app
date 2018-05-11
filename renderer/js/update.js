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
const path = require('path');
const { dialog, app } = require('electron').remote;
const { request, app_path } = utils;

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
};

var getGithubFiles = (user, repo, removeList, callback) => {
  let fileList = [], allFiles = [], dirCount = 0, dirs = 0;

  let sendReq = path => {
    request({
      host: 'api.github.com',
      path: `/repos/${user}/${repo}/contents/${path}?client_id=2cca2222a6f211d96eb5&client_secret=7ca0d642c52d3c5c4d793782993da8691152a8f3`,
      headers: { 'User-Agent': 'vk.com/danyadev' }
    }, res => {
      let body = '';

      res.on('data', ch => body += ch);
      res.on('end', () => {
        let data = JSON.parse(body);

        dirs++;

        for(let i = 0; i<data.length; i++) {
          if(data[i].type == 'dir') {
            sendReq(path + '/' + data[i].name);
          } else {
            fileList.push(app_path + path + '/' + data[i].name);
          }

          if(i == data.length-1) {
            data.forEach(file => {
              if(file.type == 'dir') dirCount++;
            });

            if(dirs > dirCount) {
              allFiles = allFiles.concat(fileList);

              removeList.forEach((file, i) => {
                let index = fileList.indexOf(file);

                if(index != -1) fileList.splice(index, 1);
                if(i == removeList.length-1) callback(fileList, allFiles);
              });
            }
          }
        }
      });
    });
  }

  sendReq('');
}

var getLocalFiles = callback => {
  let getFiles = (dir, files_) => {
    files_ = files_ || [];

    let files = fs.readdirSync(dir);

    for(let i in files) {
      let name = dir + '/' + files[i];

      if(files[i] == 'dev.json') continue;

      if(fs.statSync(name).isDirectory()) {
        getFiles(name, files_);
      } else files_.push(name.replace(/\\/g, '/'));
    }

    callback(files_);
  };

  getFiles(app_path);
}

var update = () => {
  request('https://raw.githubusercontent.com/danyadev/vk-desktop-app/master/package.json', res => {
    let body = Buffer.alloc(0);

    res.on('data', ch => body = Buffer.concat([body, ch]));
    res.on('end', () => {
      let loc_package = require(app_path + '/package.json'),
          ext_package = JSON.parse(body),
          v0 = ext_package.version.split('.'),
          v1 = loc_package.version.split('.'),
          newVer = v0[0] > v1[0] || v0[1] > v1[1] || v0[2] > v1[2],
          newBuild = ext_package.build > loc_package.build;

      if(utils.update && newVer || newBuild) {
        let noUpdate = [
          app_path + '/renderer/settings.json',
          app_path + '/renderer/users.json'
        ];

        getGithubFiles('danyadev', 'vk-desktop-app', noUpdate, (files, allFiles) => {
          getLocalFiles(localFiles => {
            let deleteFiles = localFiles.filter(file => !allFiles.includes(file));

            deleteFiles.forEach(file => fs.unlinkSync(file));
          });

          files.forEach((filename, i) => {
            let githubFile = filename.replace(app_path, '');

            if(!fs.existsSync(filename)) {
              mkdirP(filename.replace(/[A-z]+\.[A-z]+/, ''));
            }

            request({
              host: 'raw.githubusercontent.com',
              path: `/danyadev/vk-desktop-app/master${encodeURIComponent(githubFile)}`
            }, res => {
              let body = Buffer.alloc(0);

              res.on('data', ch => body = Buffer.concat([body, ch]));
              res.on('end', () => {
                fs.writeFile(filename, body, () => {
                  if(i == files.length - 1) {
                    dialog.showMessageBox({
                      type: 'info',
                      buttons: ['ОК', 'Отмена'],
                      title: 'Доступно обновление',
                      message: 'Доступно новое обновление.',
                      detail: 'Для обновления необходимо перезагрузить приложение.\nПродолжить?',
                      noLink: true
                    }, btn => {
                      if(!btn) {
                        app.relaunch();
                        app.exit();
                      }
                    });
                  }
                });
              });
            });
          });
        });
      }
    });
  });
}

module.exports = update;
