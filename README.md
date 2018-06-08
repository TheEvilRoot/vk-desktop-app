# Клиент ВКонтакте для Windows и Linux
[Правила написания кода](/docs/CODING_STYLE.md)

У проекта есть [группа ВКонтакте](https://vk.com/vk_desktop_app) и в [Telegram](https://t.me/vkdesktop)  
А также [беседа в Telegram](https://t.me/vkdesktopteam)
## Что уже реализовано
* Авторизация: с поддержкой двухфакторки или по токену (только через токен андроида)
* Прослушка музыки без рекламы и ограничений (не все функции)
* Просмотр новостей (не все функции)
* Просмотр списка друзей и групп
* Имеется несколько тем
## Сборка
1. Установите NodeJS и git
2. Установите `electron packager`: `npm i -g electron-packager`
3. Склонируйте репозиторий: `git clone https://github.com/danyadev/vk-desktop-app.git`
4. В папке с репозиторием (не внутри него) откройте консоль
5. Введите `electron-packager ./vk-desktop-app/ --platform *platform* --arch *arch* --electronVersion 2.0.2`

`*arch*` - `ia32` (32 бита) или `x64`,
`*platform*` - `win32`, `linux` или `darwin`
