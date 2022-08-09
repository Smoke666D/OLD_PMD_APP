# PDM configuration tool

## Как настроить рабочую среду?
Все описанные действия действия валидны из расчета ОС Windows 10

1. Установить Node JS
1. Установить Yarn
1. Рекомендую установить VS Code
1. Открыть Power Shell из папки проекта
1. Выполнить последовательно следующие команды
```
yarn install
yarn rebuild
yarn start
```
В случае успеха, приложение будет запущенно.

## Возможные проблемы
1. На этапе **yarn install** могут быть несовместимы некоторые пакеты. Это связано с их обновлением. Решать по месту, опираясь на подсказки в отчетах.
1. На этапе **yarn rebuild** может потребуеться установить пакеты из Microsoft Visiual Studio (не путать с VS Code). Процедура геморойная, нуглиться по записям в отчетах. Так же есть описание на портале https://www.electronjs.org/
1. Если Power Shell "не знает" команды типа git или yarn, надо добавть адреса этих утилит в PATH Windows

## Голосарий
- **JS** - Java Script. Скриптовый не типизированный язык, распростаненный в WEB
- **HTML** - язык размтеки. Т.е. описывает, что должно быть отображено
- **CSS** - таблица стилей, т.е. описывает, как должно быть отображено, что описано в HTML
- **yarn** - пакетный менеджер. С помощью него можно установить все необходимые пакеты и создать ряд скриптов типа start, rebuild или make
- **Node JS** - фреймворк, превращающий JS в серверный язык. Дает доступ к сервисам ОС, таким как файловая система, порты и т.д.
- **Electron JS** - фреймворк, превращающий приложение на Node JS в оконное приложение для десктопа

# Структура проекта
- **css** - папка с файлами стилей
- **img** - папка с изображениями, на которые ссылаються HTML и сборщик Electron (иконка приложения и т.д.).
- **js** - папка со скриптами
- **node_modules** - папка содержащая зависимые модули. Создаеться пакетным менеджером и им же редактируеться
- **release-builds** - папка в которую сборщик Electron собирает релизные пакеты
- **.gitignore** - список не индексируемых файлов и папок системой контроля версий
- **index.html** - приложение одностранийное, вся разметка описана в этом файле
- **package.json** - инструкция для yarn по установке необходимых пакетов
- **settings.json** - файл натсроек приложения
- **yarn-error.log** - лог ошибок пакетного менеджера
- **yarn.lock** - системный файл пакетного менеджера
- **js/index.js** - точка входа для Electron JS. Здесь происходит создание окна и загрузка контента
- **js/main.js** - основной файл, описывающий действия сразу после загрузки контента HTML (DOM структуры). Здесь происходит инициализация других скриптов.

# Комментарии

- Комбинация кнопок ```Ctrl + Shift + I``` открывает отладочный терминал
- Команда ```console.log()``` выводит данные в отладочный терминал