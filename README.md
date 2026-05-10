# VoltForce — сайт компании по электрике

Полноценный веб-проект: Next.js + React, API routes, Prisma, PostgreSQL, NextAuth, админ-панель.

## Что исправлено

В этой версии зависимости зафиксированы на стабильных версиях:

- Next.js 14
- React 18
- Tailwind CSS 3
- Prisma 5
- NextAuth 4

Это исправляет ошибку:

```txt
It looks like you're trying to use tailwindcss directly as a PostCSS plugin
```

## Быстрый запуск

### 1. Установите программы

Нужны:

- Node.js LTS
- PostgreSQL
- VS Code

Проверьте Node.js:

```bash
node -v
npm -v
```

### 2. Откройте проект

Распакуйте архив, откройте папку `electric-company-site` в VS Code.

В VS Code откройте терминал:

```txt
Terminal -> New Terminal
```

или клавишами:

```txt
Ctrl + `
```

### 3. Установите зависимости

```bash
npm install
```

### 4. Создайте базу данных PostgreSQL

В pgAdmin или через SQL создайте базу:

```sql
CREATE DATABASE voltforce;
```

### 5. Создайте `.env`

В корне проекта создайте файл `.env` и вставьте:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/voltforce?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-long-random-secret"
ADMIN_EMAIL="admin@voltforce.local"
ADMIN_PASSWORD="ChangeMe123!"
```

Если у PostgreSQL другой пароль, замените второе `postgres` на свой пароль.

Пример:

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/voltforce?schema=public"
```

### 6. Создайте таблицы в базе

```bash
npx prisma migrate dev --name init
```

### 7. Добавьте тестовые данные и администратора

```bash
npm run prisma:seed
```

После seed вход в админку:

```txt
Email: admin@voltforce.local
Password: ChangeMe123!
```

### 8. Запустите сайт

```bash
npm run dev
```

Откройте:

```txt
http://localhost:3000
```

Админ-панель:

```txt
http://localhost:3000/admin/login
```

## Полезные команды

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm start
```

```bash
npx prisma studio
```

## Если снова есть ошибка Tailwind

Удалите `node_modules` и `package-lock.json`, затем установите заново:

```bash
rmdir /s /q node_modules
 del package-lock.json
npm install
npm run dev
```

Для PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run dev
```

## Структура проекта

```txt
app/                 страницы сайта и API routes
components/          компоненты интерфейса
lib/                 Prisma, auth, validation
prisma/              схема базы данных и seed
public/              логотип и статические файлы
```

## API endpoints

```txt
GET    /api/services
POST   /api/services
PATCH  /api/services/:id
DELETE /api/services/:id

GET    /api/leads
POST   /api/leads
PATCH  /api/leads/:id

GET    /api/reviews
POST   /api/reviews
PATCH  /api/reviews/:id
DELETE /api/reviews/:id

GET    /api/portfolio
POST   /api/portfolio
PATCH  /api/portfolio/:id
DELETE /api/portfolio/:id
```

## Деплой

Рекомендуемый вариант:

- Vercel для Next.js
- Supabase, Neon или Railway для PostgreSQL

На хостинге нужно добавить переменные окружения из `.env`.
