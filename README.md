# **URL Shortener API**

## **Description**

This is an API for shortening URLs, built with Express.js and Prisma. It allows users to create and retrieve shortened URLs.

---

## **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Database & Migrations](#database--migrations)
5. [Usage](#usage)
6. [Endpoints](#endpoints)
7. [Testing](#testing)
8. [Technologies Used](#technologies-used)
9. [License](#license)
10. [Extra](#extra)

---

## **Prerequisites**

- Node.js (version 22.11.0)
- Yarn or NPM
- Postgres (version 15.2)

---

## **Installation**

```bash
# Clone the repository
git clone git@github.com:viniciusflores/url-shortener.git

# Navigate to the project directory
cd url-shortener

# Install dependencies
yarn
```

---

## **Configuration**

1. Clone the `.env.example`, rename to `.env` file in the project root:

```env
DATABASE_URL="your_database_connection_url"
BASE_URL="http://localhost:3000"
APP_PORT=3000
HASH_STRONG_NUMBER=7
```

1. To use docker-compose for the database local, include the following variables:

```env
DB_POSTGRES_IMAGE_NAME=postgres:15.2-alpine
DB_POSTGRES_USER=postgres-user
DB_POSTGRES_PASSWORD=ultra-secrect-password
DB_POSTGRES_DB=url-shortener
DB_POSTGRES_PORT=5432
```

1. To run docker-compose, don't forget to send the .env file

```docker-compose
docker-compose --env-file=.env up -d --build
```

---

## **Database & Migrations**

This project uses **Prisma ORM v7** with a PostgreSQL adapter (`@prisma/adapter-pg`).  
All database configuration lives in [`prisma.config.ts`](./prisma.config.ts) — the `DATABASE_URL` env variable is the single source of truth.

---

### 🆕 Fresh dev environment (first time)

Use this when setting up the project locally for the first time, or after cloning into a new machine.

```bash
# 1. Start the database (Docker)
docker-compose --env-file=.env up -d

# 2. Apply all existing migrations to the empty database
yarn prisma migrate deploy

# 3. Regenerate the Prisma client
yarn generate

# 4. Start the dev server
yarn dev
```

> `prisma migrate deploy` applies every migration in `prisma/migrations/` in order, without prompting. It is safe to run on any clean database.

---

### ✏️ Creating a new migration (after changing the schema)

Use this whenever you edit `prisma/schema.prisma` and need to persist the change to the database.

```bash
# 1. Edit prisma/schema.prisma as needed, then:
yarn migrate
# Prisma will prompt for a migration name, generate the SQL, and apply it.

# 2. Regenerate the Prisma client to pick up schema changes
yarn generate
```

> `yarn migrate` runs `prisma migrate dev`, which: creates the migration file, applies it to your local DB, and keeps `prisma/migrations/` in sync.

---

### 🔄 Re-applying / catching up after pulling changes

Use this when you pull new commits that include schema changes made by someone else.

```bash
# Apply any unapplied migrations
yarn prisma migrate deploy

# Regenerate the client
yarn generate
```

---

### 🚀 Production / staging deploy

Use `migrate deploy` (never `migrate dev`) in production — it applies pending migrations without interactive prompts or creating new ones.

```bash
yarn prisma migrate deploy
```

The `start:prod` script already does this automatically before starting the server:

```bash
yarn start:prod
# → runs: prisma migrate deploy && node dist/server.js
```

---

### 📋 Quick reference

| Situation                             | Command                      |
| ------------------------------------- | ---------------------------- |
| Inspect current DB state              | `yarn prisma migrate status` |
| Regenerate client only                | `yarn generate`              |
| Create + apply a new migration        | `yarn migrate`               |
| Apply existing migrations (CI / prod) | `yarn prisma migrate deploy` |
| Open Prisma Studio (DB browser)       | `yarn prisma studio`         |

---

## **Usage**

Start the server with the following command:

```bash
yarn dev
```

The server will be available at: `http://localhost:3000` by default.

---

## **Endpoints**

### **1. Create a Shortened URL**

**POST** `/url`
**Description:** Shortens a long URL into a unique shortened URL.

**Request Body:**

```json
{
  "original_url": "https://example.com"
}
```

**Response:**

```json
{
  "shortened_url": "http://localhost:3000/url/RHxgi+608w=="
}
```

---

### **2. Retrieve Original URL**

**GET** `url/:shortUrl`
**Description:** Redirects to the original URL based on the shortened URL.

---

## **Testing**

Tests can be performed at different levels, unitary, integrated, among others.

#### **Unit Tests**

- working in progress

#### **Integration Tests**

To run the integration tests, ensure that your application is up and running, integrated with the database, and has all database migrations already executed.

As integrated tests simulate an external agent accessing the application, a separate project was created for execution, located in the e2e folder.

As with the main project, ensure that the project has a .env file, and you can use the .env.example as a template.

```bash
# Access folder
cd e2e
# Install dependencies
yarn
# Run tests
yarn test
```

---

## **Technologies Used**

- [Express.js](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [express-rate-limit](https://express-rate-limit.mintlify.app/)
- [Winston](https://github.com/winstonjs/winston)
- [DotENV](https://github.com/motdotla/dotenv)

### **Technologies used to improve the developer experience**

- [Nodemon](https://nodemon.io/)
- [Prettier](https://prettier.io/)
- [Eslint](https://eslint.org/)
- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/lint-staged/lint-staged)

---

## **License**

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## **Extra**

Do you wanna use this app in real-time now?
use the BASE_URL = "<https://url-shortener-3kdx.onrender.com>"

- Remember to set the correct url_path and parameters to use in real-world

  - This is a example: "<https://url-shortener-3kdx.onrender.com/url/zJreQMsNHg==>"
