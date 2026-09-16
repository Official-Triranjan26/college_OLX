const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const { LocalStorage } = require('node-localstorage');

// Import your app, models, and router
const productModel = require('../../models/productModel'); // Update path as needed
const sellRoutes = require('../../routes/sellRoutes');     // Update path as needed

// Create an Express instance for testing
const app = express();
app.use(express.json());
app.use('/api/sell', sellRoutes);

describe('POST /api/sell - Sell Product Integration Tests', () => {
  const dummyUserId = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    // Set up local storage mock value expected by the controller
    const localStorage = new LocalStorage('./local');
    localStorage.setItem('user_ID', dummyUserId);

    // Connect to test database if not already connected
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27018/test_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterEach(async () => {
    // Clear product collection after every test
    await productModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Success Cases', () => {
    it('should create a product successfully when all required fields are provided', async () => {
      const validPayload = {
        productName: 'iPhone 15 Pro',
        description: 'Brand new, sealed box',
        details: '256GB storage, Natural Titanium',
        images: ['https://example.com/image1.jpg'],
        price: 999,
        picupLocation: 'New York, NY',
        catagory: 'Electronics',
      };

      const res = await request(app)
        .post('/api/sell')
        .send(validPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.messgae).toBe('success');
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.productName).toBe(validPayload.productName);
      expect(res.body.data.owner).toBe(dummyUserId);
      expect(res.body.data.sold).toBe(false);

      // Verify record exists in DB
      const dbProduct = await productModel.findById(res.body.data._id);
      expect(dbProduct).not.toBeNull();
      expect(dbProduct.productName).toBe(validPayload.productName);
    });
  });

  describe('Validation & Error Handling', () => {
    it('should return 400 if any required field is missing', async () => {
      const incompletePayload = {
        productName: 'Gaming Laptop',
        // missing description, details, images, price, picupLocation, catagory
      };

      const res = await request(app)
        .post('/api/sell')
        .send(incompletePayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('credentials not provideded !!');
    });

    it('should return 400 if price field is missing', async () => {
      const payloadWithoutPrice = {
        productName: 'Acoustic Guitar',
        description: 'Great sound quality',
        details: 'Includes hard case',
        images: ['https://example.com/guitar.jpg'],
        picupLocation: 'Austin, TX',
        catagory: 'Musical Instruments',
      };

      const res = await request(app)
        .post('/api/sell')
        .send(payloadWithoutPrice);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('credentials not provideded !!');
    });
  });
});