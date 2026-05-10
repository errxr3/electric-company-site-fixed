# Запуск на Sprinthost с базой Neon

1. В панели Sprinthost откройте `Сайты -> Веб-серверы` и выберите для сайта `Node.js 22`.

2. Загрузите файлы проекта в папку сайта, обычно:

```bash
~/domains/ваш-домен/public_html
```

3. В файле `.env.production` замените `NEXTAUTH_URL` на реальный домен Sprinthost.

4. Через SSH перейдите в папку сайта:

```bash
cd ~/domains/ваш-домен/public_html
```

5. Выполните одну команду:

```bash
bash setup-sprinthost.sh
```

Скрипт сам создаст `.htaccess`, установит зависимости, подключит Prisma к Neon, соберет сайт и перезапустит Passenger.

Если нужно просто перезапустить сайт после изменений:

```bash
touch tmp/restart.txt
```

Фото портфолио хранятся в `public/uploads/portfolio`, эту папку нужно загружать вместе с проектом.
