# **URL Shortener API**

## **Description**

This is an API for shortening URLs, built with Express.js and Prisma. It allows users to create and retrieve shortened URLs.

---

## **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage](#usage)
5. [Endpoints](#endpoints)
6. [Testing](#testing)
7. [Technologies Used](#technologies-used)
8. [License](#license)
9. [Extra](#extra)

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
cd url-shortener-api

# Install dependencies
yarn
```

---

## **Configuration**

1. Clone the `.env.example`, rename to `.env` file in the project root:

```env
DATABASE_URL="your_database_connection_url"
BASE_URL="http://localhost:3000"
PORT=3000
HASH_STRONG_NUMBER=7
```

2. To use docker-compose for the database local, include the following variables:

```env
DB_POSTGRES_IMAGE_NAME=postgres:15.2-alpine
DB_POSTGRES_USER=postgres-user
DB_POSTGRES_PASSWORD=ultra-secrect-password
DB_POSTGRES_DB=url-shortener
DB_POSTGRES_PORT=5432
```

3. To run docker-compose, don't forget to send the .env file

```docker-compose
docker-compose --env-file=.env up -d --build
```

4. Run Prisma migrations to set up the database:

```bash
yarn prisma migrate deploy
```

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
  "shortened_url": "http://localhost:3000/RHxgi+608w=="
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
