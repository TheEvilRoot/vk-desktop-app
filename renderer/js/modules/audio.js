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

// Доступ к музыке имеется только у версии API 5.65 и выше.

const { BrowserWindow } = require('electron').remote;
const https = require('https');

danyadev.audio = {};

var audio = qs('.audio'),
    audiolist = qs('.audiolist'),
    audioplayer = qs('.audioplayer'),
    content = qs('.content'),
    player_cover = qs('.player_cover'),
    player_back = qsa('.player_button')[0],
    player_next = qsa('.player_button')[1],
    player_real_time = qs('.player_real_time'),
    player_played_time = qs('.player_played_time'),
    player_progress_loaded = qs('.player_progress_loaded'),
    player_progress_played = qs('.player_progress_played'),
    player_progress_wrap = qs('.player_progress_wrap'),
    player_volume_wrap = qs('.player_volume_wrap'),
    player_volume_this = qs('.player_volume_this'),
    player_icon_repeat = qs('.player_icon_repeat'),
    player_icon_recoms = qs('.player_icon_recoms');

audio._play = audio.play;

audio.play = () => audio._play().catch(err => {
  if(!err.message.match(/https:\/\/goo\.gl\/LdLk22/)) {
    console.error(err);
  }
});

player_volume_this.style.width = settings.volume * 100 + '%';
audio.volume = settings.volume;

danyadev.audio.renderedItems = 0;
danyadev.audio.track_id = 0;

var load = () => {
  vkapi.method('audio.get', null, data => {
    if(data.error) {
      qs('.audiolist_info').innerHTML = 'Обход блокировки аудио...';
      
      vkapi.method('auth.refreshToken', {
        access_token: danyadev.user.access_token,
        receipt: 'JSv5FBbXbY:APA91bF2K9B0eh61f2WaTZvm62GOHon3-vElmVq54ZOL5PHpFkIc85WQUxUH_wae8YEUKkEzLCcUC5V4bTWNNPbjTxgZRvQ-PLONDMZWo_6hwiqhlMM7gIZHM2K2KhvX-9oCcyD1ERw4'
      }, ref => {
        danyadev.user.access_token = ref.response.token;
        
        let userIndex = users.list.indexOf(danyadev.user);
        
        users.list[userIndex] = danyadev.user;
        users.save();
        
        load();
      });
      
      return;
    }
    
    qs('.audiolist_info').innerHTML = 'Загрузка аудиозаписей...';
    
    danyadev.audio.count = data.response.count;
    danyadev.audio.list = data.response.items;

    if(!danyadev.audio.list.length) {
      qs('.audiolist_info').innerHTML = 'Список аудиозаписей пуст';
    } else render();
  }, 'audiolist_info');
}

var render = cb => {
  let block = { innerHTML: '' },
      endID = danyadev.audio.renderedItems + 15;

  let renderItem = () => {
    let item = danyadev.audio.list[danyadev.audio.renderedItems],
        minutes = Math.floor(item.duration / 60), cover,
        hours = minutes >= 60 ? Math.floor(minutes / 60) + ':' : '',
        secondsZero = (item.duration % 60) < 10 ? '0' : '',
        seconds = ':' + secondsZero + item.duration % 60;

    if(hours != '') {
      let minutesZero = (minutes - parseInt(hours) * 60) < 10 ? '0' : '';

      minutes = minutesZero + (minutes - parseInt(hours) * 60);
    }

    let time = hours + minutes + seconds;

    if(item.album && item.album.thumb) cover = item.album.thumb.photo_68;
    else cover = 'images/empty_cover.svg';

    let audio_block;

    if(item.url) {
      audio_block = `<div class='audio_item' src='${item.url}' data-id='${item.id}'`
                  + `onclick='require("./js/modules/audio").toggleAudio(this, event)'>`;
    } else {
      audio_block = `<div class='audio_item_locked'
                          title='Аудиозапись изъята из публичного доступа'>`;
    }

    block.innerHTML += `
      ${audio_block}
        <div class='audio_covers'>
          <div class='audio_cover' style='background-image: url("${cover}")'></div>
          <div class='audio_cover_play'></div>
        </div>
        <div class='audio_names'>
          <div class='audio_name'>${item.title}</div>
          <div class='audio_author'>${item.artist}</div>
        </div>
        <div class='audio_right_block'>
          <div class='audio_right_btns'>
            <!-- тут будут все кнопки вместо 1 скачки, при наведении -->
          </div>
          <div class='audio_real_time audio_active_time'>${time}</div>
          <div class='audio_played_time'>0:00</div>
        </div>
      </div>
    `.trim();

    danyadev.audio.renderedItems++;

    if(danyadev.audio.renderedItems < endID && danyadev.audio.list[danyadev.audio.renderedItems]) {
      setTimeout(renderItem, 0);
    } else {
      if(danyadev.audio.renderedItems == 15
      || (danyadev.audio.renderedItems < 15 &&
      danyadev.audio.renderedItems == danyadev.audio.count)) { // когда загрузился первый блок
        audiolist.innerHTML = '';

        qs('.audiolist_info').style.display = 'none';
        qs('.audiolist_utils').style.display = 'block';
      }

      audiolist.innerHTML += block.innerHTML;

      if(cb == 'play next') {
        player_next.click();
        danyadev.audio.blockNext = 0;
      }

      if((danyadev.audio.count <= 15
      && danyadev.audio.renderedItems == danyadev.audio.count)
      || danyadev.audio.renderedItems <= 15) initPlayer();

      if(danyadev.audio.renderedItems < danyadev.audio.count) loadSoundBlock();
    }
  }

  renderItem();
}

var loadSoundBlock = () => {
  content.addEventListener('scroll', renderNewItems);
  
  let h = window.screen.height > audiolist.clientHeight;
  
  if(h || audiolist.clientHeight - window.outerHeight < window.scrollY) renderNewItems();
}

var renderNewItems = () => {
  let h = window.screen.height > audiolist.clientHeight,
      l = audiolist.clientHeight - window.outerHeight < content.scrollTop,
      a = qs('.content_audio').parentNode.classList.contains('content_active');
  
  if(a && (h || l)) {
    content.removeEventListener('scroll', renderNewItems);
    render();
  }
}

var initPlayer = () => {
  let firstItemId = 0;

  let checkLocked = () => {
    if(audiolist.children[firstItemId].classList.contains('audio_item_locked')) {
      firstItemId++;
      checkLocked();
    } else {
      audio.audio_item = audiolist.children[firstItemId];
      audio.audio_item.children[0].children[1].classList.add('audio_cover_has_play');
      audio.audio_item.classList.add('audio_item_active');

      audio.src = audio.audio_item.attributes.src.value;
      toggleTime('played');

      player_real_time.innerHTML = audio.audio_item.children[2].children[1].innerHTML;

      let bgi = audio.audio_item.children[0].children[0].style.backgroundImage;

      if(bgi != 'url("https://vk.com/images/audio_row_placeholder.png")') {
        player_cover.style.backgroundImage = bgi;
      } else player_cover.style.backgroundImage = 'url("images/empty_cover.svg")';

      qs('.player_name').innerHTML = '<span class=\'player_author\'>'
      + audio.audio_item.children[1].children[1].innerHTML + '</span> – '
      + audio.audio_item.children[1].children[0].innerHTML;
    }
  }

  checkLocked();
}

var toggleAudio = (track, event) => {
  if(!track || event && event.target != track.children[0].children[1]) return;

  if(track.classList.contains('audio_item_locked')) {
    if(danyadev.audio.play_prev) {
      danyadev.audio.track_id--;
      player_back.click();
    } else {
      danyadev.audio.track_id++;
      player_next.click();
    }

    return;
  }

  if(audio.src != track.attributes.src.value) toggleTime('real');

  audio.audio_item = track;
  player_real_time.innerHTML = track.children[2].children[1].innerHTML;
  danyadev.audio.track_id = [].slice.call(audiolist.children).indexOf(track);

  let audio_item_active = qs('.audio_item_active'),
      audio_cover_stop = qs('.audio_cover_stop');

  if(audio_cover_stop) {
    audio_cover_stop.classList.add('audio_cover_play');
    audio_cover_stop.classList.remove('audio_cover_stop');
  }

  let audio_item = track, cover_util = track.children[0].children[1];

  if(audio.src != track.attributes.src.value) { // если другой трек
    player_progress_loaded.style.width = '';
    player_progress_played.style.width = '';
    
    if(player_icon_repeat.classList.contains('active')) {
      player_icon_repeat.classList.remove('active');
      
      danyadev.audio.repeat = false;
    }
    
    audio.src = track.attributes.src.value;
    toggleTime('played');

    if(qs('.audio_cover_has_play')) {
      qs('.audio_cover_has_play').classList.remove('audio_cover_has_play');
    }

    cover_util.classList.add('audio_cover_has_play');

    if(audio_item_active) audio_item_active.classList.remove('audio_item_active');

    if(qs('.hidden_time')) {
      qs('.hidden_time').style.display = '';
      qs('.hidden_time').classList.remove('hidden_time');

      qs('.showed_time').innerHTML = '';
      qs('.showed_time').classList.remove('showed_time');
    }

    let bgi = track.children[0].children[0].style.backgroundImage;

    if(bgi != 'url("images/empty_cover.svg")') {
      player_cover.style.backgroundImage = bgi;
    } else player_cover.style.backgroundImage = 'url("images/empty_cover.svg")';

    qs('.player_name').innerHTML = '<span class=\'player_author\'>'
    + audio.audio_item.children[1].children[1].innerHTML + '</span> – '
    + audio.audio_item.children[1].children[0].innerHTML;
  }

  if(audio.paused) {
    cover_util.classList.add('audio_cover_stop');
    cover_util.classList.remove('audio_cover_play');
    audio_item.classList.add('audio_item_active');

    if(qs('.player_play')) {
      qs('.player_btn').title = 'Приостановить';

      qs('.player_play').classList.add('player_pause');
      qs('.player_play').classList.remove('player_play');
    }

    audio.play();
  } else {
    cover_util.classList.add('audio_cover_play');
    cover_util.classList.remove('audio_cover_stop');

    qs('.player_btn').title = 'Воспроизвести';

    qs('.player_pause').classList.add('player_play');
    qs('.player_pause').classList.remove('player_pause');

    audio.pause();
  }
}

var matchPlayedTime = () => {
  if(!audiolist.children[danyadev.audio.track_id]) return;

  let minutes = Math.floor(audio.currentTime / 60),
      hours = minutes >= 60 ? Math.floor(minutes / 60) + ':' : '',
      secondsZero = (audio.currentTime % 60) < 10 ? '0' : '',
      seconds = ':' + secondsZero + Math.floor(audio.currentTime) % 60,
      audio_played_time = audiolist.children[danyadev.audio.track_id].children[2].children[2];

  if(hours != '') {
    let minutesZero = (minutes - parseInt(hours) * 60) < 10 ? '0' : '';

    minutes = minutesZero + (minutes - parseInt(hours) * 60);
  }

  audio_played_time.innerHTML = player_played_time.innerHTML = hours + minutes + seconds;
}

var toggleTime = type => {
  let audio_real_time = audiolist.children[danyadev.audio.track_id].children[2].children[1],
      audio_played_time = audiolist.children[danyadev.audio.track_id].children[2].children[2];

  if(type == 'played') { // переключаем на played
    player_real_time.classList.remove('player_active_time');
    audio_real_time.classList.remove('audio_active_time');

    player_played_time.classList.add('player_active_time');
    audio_played_time.classList.add('audio_active_time');
  } else { // переключаем на real
    player_real_time.classList.add('player_active_time');
    audio_real_time.classList.add('audio_active_time');

    player_played_time.classList.remove('player_active_time');
    audio_played_time.classList.remove('audio_active_time');
  }
}

player_real_time.addEventListener('click', () => toggleTime('played'));
player_played_time.addEventListener('click', () => toggleTime('real'));

player_back.addEventListener('click', () => {
  let audioItem = audiolist.children[danyadev.audio.track_id - 1];

  danyadev.audio.play_prev = 1;

  if(!audioItem && !audio.paused) toggleAudio(audiolist.children[0]);
  else if(!audioItem) {
    danyadev.audio.play_prev = false;
    return;
  } else {
    danyadev.audio.repeat = false;

    if(player_icon_repeat.classList.contains('active')) {
      player_icon_repeat.classList.remove('active');
    }

    toggleAudio(audioItem);
  }
});

qs('.shuffle').addEventListener('click', () => {
  if(danyadev.audio.renderedItems % 15 != 0
    && danyadev.audio.renderedItems != danyadev.audio.count) return;

  danyadev.audio.track_id = 0;
  danyadev.audio.renderedItems = 0;
  danyadev.audio.repeat = false;

  if(player_icon_repeat.classList.contains('active')) {
    player_icon_repeat.classList.remove('active');
  }

  if(!audio.paused) {
    toggleAudio();

    qs('.player_pause').classList.add('player_play');
    qs('.player_pause').classList.remove('player_pause');
  }

  audio.audio_item = undefined;
  audio.src = '';

  player_progress_loaded.style.width = '';
  player_progress_played.style.width = '';

  content.removeEventListener('scroll', renderNewItems);
  arrayShuffle(danyadev.audio.list);
  render();
});

player_next.addEventListener('click', () => {
  let audioTrack = audiolist.children[danyadev.audio.track_id + 1];

  if(!audioTrack) {
    if(danyadev.audio.renderedItems < danyadev.audio.count) {
      if(danyadev.audio.blockNext) return;

      danyadev.audio.blockNext = 1;
      render('play next');
      return;
    } else audioTrack = audiolist.children[0];
  }

  danyadev.audio.play_prev = false;
  danyadev.audio.repeat = false;

  if(player_icon_repeat.classList.contains('active')) {
    player_icon_repeat.classList.remove('active');
  }

  toggleAudio(audioTrack);
});

qs('.player_btn').addEventListener('click', () => {
  let audioItem = audiolist.children[danyadev.audio.track_id];

  toggleAudio(audioItem);
});

player_icon_repeat.addEventListener('click', () => {
  if(player_icon_repeat.classList.contains('active')) {
    player_icon_repeat.classList.remove('active');

    danyadev.audio.repeat = false;
  } else {
    player_icon_repeat.classList.add('active');

    danyadev.audio.repeat = true;
  }
});

qs('.player_icon_recoms').addEventListener('click', el => {
  if(!danyadev.audio.count) return;
  
  if(danyadev.audio.recoms) {
    danyadev.audio.recoms = false;

    audiolist.innerHTML = '';
    
    danyadev.audio.count = 0;
    danyadev.audio.list = [];
    danyadev.audio.track_id = 0;
    danyadev.audio.renderedItems = 0;
    
    load();
  } else {
    danyadev.audio.recoms = true;
    
    let id = danyadev.audio.list[danyadev.audio.track_id].id;
    
    audiolist.innerHTML = '';
    
    // ставим похожие
    vkapi.method('audio.getRecommendations', {
      target_audio: `${danyadev.user.id}_${id}`,
      count: 1000
    }, data => {
      danyadev.audio.count = data.response.items.length;
      danyadev.audio.list = data.response.items;
      danyadev.audio.track_id = 0;
      danyadev.audio.renderedItems = 0;
  
      render();
    }, 'audiolist_info');
  }
});

audio.addEventListener('ended', () => { // переключение на следующее аудио
  let id;

  if(!danyadev.audio.repeat) {
    audio.audio_item.children[0].children[1].classList.add('audio_cover_play');
    audio.audio_item.children[0].children[1].classList.remove('audio_cover_stop');
    audio.audio_item.classList.remove('audio_item_active');

    if(player_icon_repeat.classList.contains('active')) {
      player_icon_repeat.classList.remove('active');
    }

    id = danyadev.audio.track_id + 1;
  } else id = danyadev.audio.track_id;

  let audioItem = audiolist.children[id];

  if(!audioItem) {
    if(danyadev.audio.renderedItems < danyadev.audio.count) {
      if(danyadev.audio.blockNext) return;

      danyadev.audio.blockNext = 1;
      render('play next');
      return;
    } else audioItem = audiolist.children[0];
  }

  setTimeout(() => toggleAudio(audioItem), 100);
});

audio.addEventListener('progress', () => { // сколько прогружено
  if(audio.buffered.length > 0) {
    player_progress_loaded.style.width = audio.buffered.end(0) / audio.duration * 100 + '%';
  }
});

audio.addEventListener('timeupdate', () => { // сколько проиграно
  matchPlayedTime();

  if(!danyadev.audio.seekstate) {
    player_progress_played.style.width = (audio.currentTime / audio.duration) * 100 + '%';
  }
});

// прокрутка трека
player_progress_wrap.addEventListener('mousedown', ev => {
  if(!audio.duration) return; // нет времени -> нет трека -> выходим отсюда

  danyadev.audio.seekstate = 1;
  player_progress_wrap.classList.add('player_progress_active');

  let mousemove = e => {
    let offsetx = e.pageX - player_progress_wrap.offsetLeft - audioplayer.offsetLeft,
        curTime = offsetx / player_progress_wrap.offsetWidth, selWidth = curTime * 100;

    if(selWidth > 100) selWidth = 100;
    if(selWidth < 0) selWidth = 0;

    player_progress_played.style.width = selWidth + '%';
  }

  let mouseup = e => {
    danyadev.audio.seekstate = 0;
    player_progress_wrap.classList.remove('player_progress_active');

    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
    
    let offsetx = e.pageX - player_progress_wrap.offsetLeft - audioplayer.offsetLeft;

    audio.currentTime = (offsetx * audio.duration) / player_progress_wrap.offsetWidth;
  }

  document.addEventListener('mousemove', mousemove);
  document.addEventListener('mouseup', mouseup);

  ev.preventDefault();
});

// громкость
player_volume_wrap.addEventListener('mousedown', ev => {
  player_volume_wrap.classList.add('player_volume_active');
  
  let offsetx = ev.pageX - player_volume_wrap.offsetLeft - audioplayer.offsetLeft,
      volume = offsetx / player_volume_wrap.offsetWidth;

  volume < 0 ? volume = 0 : '';
  volume > 1 ? volume = 1 : '';

  let selWidth = volume * 100;

  audio.volume = volume;
  player_volume_this.style.width = selWidth + '%';

  let mousemove = e => {
    offsetx = e.pageX - player_volume_wrap.offsetLeft - audioplayer.offsetLeft;
    volume = offsetx / player_volume_wrap.offsetWidth;

    volume < 0 ? volume = 0 : '';
    volume > 1 ? volume = 1 : '';

    selWidth = volume * 100;

    audio.volume = volume;
    player_volume_this.style.width = selWidth + '%';
  }

  let mouseup = e => {
    player_volume_wrap.classList.remove('player_volume_active');

    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
  }

  document.addEventListener('mousemove', mousemove);
  document.addEventListener('mouseup', mouseup);

  ev.preventDefault();
});

var arrayShuffle = arr => {
	for(
    let j, x, i = arr.length; i;
    j = Math.floor(Math.random() * i),
    x = arr[--i],
    arr[i] = arr[j],
    arr[j] = x
  );
};

var downloadAudio = id => {
  let data = danyadev.audio.list[id],
      author = data.artist, name = data.title, url = data.url,
      file_name = `${author} – ${name}.mp3`,
      file_path = `${utils.downloadsPath}/${file_name}`;
  
  utils.request(url, res => {
    let body = Buffer.alloc(0);

    res.on('data', ch => body = Buffer.concat([body, ch]));
    res.on('end', () => {
      fs.writeFile(file_path, body, () => {
        // файл скачан
        console.log(`Аудиозапись "${file_name}" скачана в папку загрузок.`);
      });
    });
  });
}

module.exports = {
  load,
  toggleAudio,
  toggleTime,
  downloadAudio
}
