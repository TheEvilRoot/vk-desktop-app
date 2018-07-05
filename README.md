# Клиент ВКонтакте для Windows, Mac и Linux
[Правила написания кода](/docs/CODING_STYLE.md)

У проекта есть [группа ВКонтакте](https://vk.com/vk_desktop_app) и в [Telegram](https://t.me/vkdesktop)  
А также [беседа в Telegram](https://t.me/vkdesktopteam)
## Что уже реализовано
* Авторизация с поддержкой двухфакторки и вход по токену
* Прослушка музыки без рекламы и ограничений (не все функции)
* Просмотр новостей (не все функции)
* Просмотр списка друзей и групп (тоже не все функции)
* Темная тема
* Мультиаккаунт
## Сборка
1. Установите [Node.js][https://nodejs.org/en/] и [git][https://git-scm.com/]
2. Откройте консоль
3. Установите `electron packager`: `npm i -g electron-packager`
4. Склонируйте репозиторий: `git clone https://github.com/danyadev/vk-desktop-app.git`  
если хотите собрать бета версию, то допишите ` -b dev`
5. Потом введите это, заменив некоторые слова:
`electron-packager ./vk-desktop-app/ --platform *platform* --arch *arch* --electronVersion 2.0.4`

`*arch*` - `ia32` (32 бита) или `x64`  
`*platform*` - `win32`, `linux` или `darwin`
