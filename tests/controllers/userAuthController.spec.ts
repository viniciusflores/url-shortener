import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client';
import { hashUserPassword } from '../../src/lib/crypto';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

describe('User Auth Controller', () => {
  const username = 'test@gmail.com';
  const password = '123456';

  beforeEach(async () => {
    // Clean up any existing test user
    await prisma.user.deleteMany({
      where: {
        email: username,
      },
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.user.deleteMany({
      where: {
        email: username,
      },
    });
  });

  it('should be possible to register a user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: username, password: password });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ email: username });
  });

  it('should return 400 for registration with missing email', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ password: password });

    expect(response.status).toBe(400);
    const errorMessage = JSON.parse(response.text).message;
    expect(errorMessage).toBe('Bad Request: Missing required fields');
  });

  it('should return 400 for registration with missing password', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: username });

    expect(response.status).toBe(400);
    const errorMessage = JSON.parse(response.text).message;
    expect(errorMessage).toBe('Bad Request: Missing required fields');
  });

  it('should return 400 for registration with empty email', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: '', password: password });

    expect(response.status).toBe(400);
    const errorMessage = JSON.parse(response.text).message;
    expect(errorMessage).toBe('Bad Request: Missing required fields');
  });

  it('should return 400 for registration with empty password', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: username, password: '' });

    expect(response.status).toBe(400);
    const errorMessage = JSON.parse(response.text).message;
    expect(errorMessage).toBe('Bad Request: Missing required fields');
  });

  it('should be possible to login a user', async () => {
    const hashedPassword = await hashUserPassword(password);
    await prisma.user.create({
      data: {
        email: username,
        password_hashed: hashedPassword,
      },
    });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: username, password: password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should return 400 for login with missing email', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ password: password });

    expect(response.status).toBe(400);
    const errorMessage = JSON.parse(response.text).message;
    expect(errorMessage).toBe('Bad Request: Missing required fields');
  });

  it('should return 400 for login with missing password', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: username });

    expect(response.status).toBe(400);
    const errorMessage = JSON.parse(response.text).message;
    expect(errorMessage).toBe('Bad Request: Missing required fields');
  });

  it('should return 500 for login with non-existent user', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'nonexistent@gmail.com', password: password });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it('should return 500 for login with incorrect password', async () => {
    const hashedPassword = await hashUserPassword(password);
    await prisma.user.create({
      data: {
        email: username,
        password_hashed: hashedPassword,
      },
    });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: username, password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it('should not allow duplicate user registration', async () => {
    // First registration should succeed
    const firstResponse = await request(app)
      .post('/auth/register')
      .send({ email: username, password: password });

    expect(firstResponse.status).toBe(201);

    // Second registration with same username should fail
    const secondResponse = await request(app)
      .post('/auth/register')
      .send({ email: username, password: password });

    expect(secondResponse.status).toBe(409);
  });

  it('should properly hash passwords during registration', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: username, password: password });

    expect(response.status).toBe(201);

    // Verify that the user was created with a hashed password
    const user = await prisma.user.findUnique({
      where: {
        email: username,
      },
    });

    expect(user).toBeDefined();
    expect(user?.password_hashed).toBeDefined();
    expect(user?.password_hashed).not.toBe(password); // Should be different from plain text
  });
});
