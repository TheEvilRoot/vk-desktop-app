/*
  Copyright © 2018 danyadev
  Лицензия - Apache 2.0

  Контактные данные:
   vk: https://vk.com/danyadev
   или https://vk.com/danyadev0
   telegram: https://t.me/danyadev
   github: https://github.com/danyadev/vk-desktop-app
*/

try {
  require('electron-reload')(__dirname, {
    ignored: [
      `${__dirname}/.git`,
      `${__dirname}/core`,
      `${__dirname}/docs`,
      `${__dirname}/node_modules`,
      `${__dirname}/changelog.txt`,
      `${__dirname}/index.js`,
      `${__dirname}/LICENSE`,
      `${__dirname}/README.md`,
      `${__dirname}/package.json`
    ]
  });
} catch(e) {};

const { app, BrowserWindow } = require('electron');

app.on('window-all-closed', () => {
  if(process.platform != 'darwin') app.quit();
});

app.on('ready', () => {
  win = new BrowserWindow({
    minWidth: 640,
    minHeight: 480,
    show: false
  });
  
  win.webContents.executeJavaScript(`[localStorage.getItem('settings'), screen.availWidth, screen.availHeight]`)
  .then(data => {
    if(!data[0]) return;
    data[0] = JSON.parse(data[0]).window;
    
    let q = w => w < 0 ? -w : w,
        maximized = data[0].width > data[1] && data[0].height > data[2];
    
    win.setBounds({
      x: q(data[0].x),
      y: q(data[0].y),
      width: maximized ? data[1] : data[0].width,
      height: maximized ? data[2] : data[0].height
    });
    
    if(maximized) win.maximize();
  });

  win.setMenu(null);
  win.loadFile('renderer/index.html');
  win.on('ready-to-show', win.show);
  win.on('closed', () => win = null);
});
