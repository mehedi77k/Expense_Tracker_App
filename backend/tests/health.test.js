const request = require('supertest');
const { createApp } = require('../src/app');

describe('health', () => {
  it('returns ok', async () => {
    const response = await request(createApp()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
