// tests/integration/healthcheck.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const { connectDB, dropDB, dropCollections } = require('../setup/test-db');

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await dropCollections();
});

afterAll(async () => {
  await dropDB();
});

describe('Sanity Check: Integration Test Setup', () => {
  it('should verify MongoDB connection state is active', () => {
    // 1 = Connected
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('POST /api/healthcheck -> should write to MongoDB and return 201', async () => {
    const payload = { message: 'hello_mongo' };

    const response = await request(app)
      .post('/api/healthcheck')
      .send(payload)
      .expect('Content-Type', /json/);

    // Assert HTTP status code
    expect(response.statusCode).toBe(201);

    // Assert Response Body
    expect(response.body.success).toBe(true);
    expect(response.body.ping).toHaveProperty('_id');
    expect(response.body.ping.message).toBe('hello_mongo');
  });
});