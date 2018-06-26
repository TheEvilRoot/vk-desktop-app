# Клиент ВКонтакте для Windows и Linux
[Правила написания кода](/docs/CODING_STYLE.md)

У проекта есть [группа ВКонтакте](https://vk.com/vk_desktop_app) и в [Telegram](https://t.me/vkdesktop)  
А также [беседа в Telegram](https://t.me/vkdesktopteam)
## Что уже реализовано
* Авторизация с поддержкой двухфакторки и вход по токену
* Прослушка музыки без рекламы и ограничений (не все функции)
* Просмотр новостей (не все функции)
* Просмотр списка друзей и групп (тоже не все функции)
* Имеется несколько темных тем
## Сборка
1. Установите NodeJS и git
2. Установите `electron packager`: `npm i -g electron-packager`
3. Откройте консоль
3. Склонируйте репозиторий: `git clone https://github.com/danyadev/vk-desktop-app.git`
5. Потом введите это, заменив некоторые слова:
`electron-packager ./vk-desktop-app/ --platform *platform* --arch *arch* --electronVersion 2.0.3`

`*arch*` - `ia32` (32 бита) или `x64`,
`*platform*` - `win32`, `linux` или `darwin`
