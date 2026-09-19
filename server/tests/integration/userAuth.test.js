// Mock node-localstorage in memory to prevent Docker disk lockups
jest.mock('node-localstorage', () => {
  return {
    LocalStorage: jest.fn().mockImplementation(() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
        clear: jest.fn(() => { store = {}; }),
        removeItem: jest.fn((key) => { delete store[key]; }),
      };
    }),
  };
});
const request = require('supertest');
//  const mongoose = require('mongoose');
const app = require('../../app');
const UserModel = require('../../models/userModel');
const { connectDB, dropDB, dropCollections } = require('../setup/test-db');

beforeAll(async () => await connectDB());
afterEach(async () => await dropCollections());
afterAll(async () => await dropDB());

describe('User Authentication Integration Tests (/api/user)', () => {

  describe('POST /api/user/signup', () => {
    it('should create a new user successfully and return status 201', async () => {
      const signupPayload = {
        name: 'John Doe',
        email: 'john@college.edu',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/user/signup')
        .send(signupPayload);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(signupPayload.name);
      expect(response.body.email).toBe(signupPayload.email);
      expect(response.body).toHaveProperty('token');

      // Verify direct database persistence
      const dbUser = await UserModel.findOne({ email: signupPayload.email });
      expect(dbUser).not.toBeNull();
      expect(dbUser.name).toBe(signupPayload.name);
    });

    it('should return status 400 if required fields are missing', async () => {
      const incompletePayload = {
        name: 'John Doe',
        // email is missing
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/user/signup')
        .send(incompletePayload);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('credentials are needed !');
    });

    it('should return status 400 if user with email already exists', async () => {
      const existingUser = {
        name: 'John Doe',
        email: 'john@college.edu',
        password: 'password123',
      };

      // Register first instance
      await request(app).post('/api/user/signup').send(existingUser);

      // Attempt duplicate registration
      const response = await request(app)
        .post('/api/user/signup')
        .send(existingUser);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('user with credential exists');
    });
  });

  describe('POST /api/user/signin', () => {
    beforeEach(async () => {
      // Seed user for signin tests
      await request(app).post('/api/user/signup').send({
        name: 'Jane Doe',
        email: 'jane@college.edu',
        password: 'password123',
      });
    });

    it('should authenticate user and return status 200 with JWT token', async () => {
      const signinPayload = {
        email: 'jane@college.edu',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/user/signin')
        .send(signinPayload);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('Jane Doe');
      expect(response.body.email).toBe(signinPayload.email);
      expect(response.body).toHaveProperty('token');
    });

    it('should return status 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/user/signin')
        .send({ email: 'jane@college.edu' }); // password missing

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('credentials not provideded !!');
    });

    it('should return status 400 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/user/signin')
        .send({
          email: 'jane@college.edu',
          password: 'wrongpassword',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('invalid credentials !!');
    });

    it('should return status 400 if user does not exist', async () => {
      const response = await request(app)
        .post('/api/user/signin')
        .send({
          email: 'nonexistent@college.edu',
          password: 'password123',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('invalid credentials !!');
    });
  });
});