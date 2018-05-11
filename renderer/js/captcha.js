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

module.exports = (src, sid, callback) => {
  let modal = document.createElement('div');
  
  modal.classList.add(`captcha_modal`);
  modal.classList.add(`cm_${sid}`);
  document.body.appendChild(modal);
  
  modal.style.display = 'flex';
  
  modal.innerHTML = `
    <div class="captcha">
      <div class="captcha_img ci_${sid}"><img src='${src}'></div>
      <div class="captcha_info">Не видно? Нажмите на картинку</div>
      <div class="captcha_key ck_${sid}"><input type="text" placeholder="Введите капчу"></div>
      <div class="captcha_btn cb_${sid}"><input type="button" value='Продолжить'></div>
    </div>
  `.trim();
  
  let btn = qs(`.cb_${sid} input`),
      input = qs(`.ck_${sid} input`),
      img = qs(`.ci_${sid} img`);
  
  img.addEventListener('click', () => img.src += ~img.src.indexOf("rnd=") ? "1" : "&rnd=1");
  btn.addEventListener('click', () => {
    qs(`.cm_${sid}`).remove();
    callback(input.value, sid);
  });
  
  input.addEventListener('keydown', e => e.keyCode == 13 ? btn.click() : '');
}
