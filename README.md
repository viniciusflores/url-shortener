# **URL Shortener API**

## **Description**

This is an API for shortening URLs, built with Express.js and Prisma. It allows users to create and retrieve shortened URLs with click tracking and user authentication.

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
DB_POSTGRES_IMAGE_NAME=postgres:15-alpine
DB_POSTGRES_USER=postgres
DB_POSTGRES_PASSWORD=postgres
DB_POSTGRES_DB=url-shortener-db
DB_POSTGRES_PORT=5432
```

## **Database & Migrations**

Run the following commands to set up your database:

```bash
npx prisma migrate dev --name init
```

---

## **Usage**

After setting up the database and configuration, start the server:

```bash
yarn dev
```

---

## **Endpoints**

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get authentication token

### URL Management

- `GET /url/:hash` - Redirects to the original URL
- `POST /url/` - Creates a new random shortened URL (requires authentication)
- `POST /url/custom` - Creates a custom shortened URL (requires authentication)

The API tracks:

- Click count for each shortened URL
- Last accessed timestamp
- User ownership of URLs

---

## **Testing**

Tests are written using Vitest. Run them with:

```bash
yarn test
```

Vitest is a fast test runner for JavaScript projects that provides a Jest-compatible API and is optimized for modern JavaScript environments.

---

## **Technologies Used**

- Express.js - Web application framework for Node.js
- Prisma - Next-generation ORM for Node.js and TypeScript
- PostgreSQL - Open source relational database
- Node.js - JavaScript runtime environment
- Vitest - Fast test runner for JavaScript projects
- Docker - Containerization platform for database services

---

## **License**

MIT

---

## **Extra**

This project includes:

- User authentication system
- URL click tracking and statistics
- Docker configuration for local database setup
- Prisma database migrations
- User-specific URL management
