const request = require('supertest');
const { createApp } = require('../src/app');

describe('auth', () => {
  it('registers a user and returns tokens', async () => {
    const app = createApp();
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('logs in a registered user', async () => {
    const app = createApp();
    await request(app).post('/api/v1/auth/register').send({
      name: 'Login User',
      email: 'login@example.com',
      password: 'Password123!',
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'login@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
  });
});
