const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Product = require('../../models/productModel');
const { connectDB, dropDB, dropCollections } = require('../setup/test-db');

beforeAll(async () => await connectDB());
afterEach(async () => await dropCollections());
afterAll(async () => await dropDB());

describe('Listed Products API Integration Tests (/api/listed)', () => {
  const dummyOwnerId = new mongoose.Types.ObjectId();

  // Helper function to seed test products
  const seedProducts = async () => {
    await Product.create([
      {
        productName: 'iPhone 13',
        description: 'Good condition',
        details: '128GB Black',
        images: ['img1.jpg'],
        price: 500,
        picupLocation: 'Campus A',
        catagory: 'electronics',
        sold: false,
        owner: dummyOwnerId,
      },
      {
        productName: 'Calculus Textbook',
        description: 'Hardcover',
        details: '10th Edition',
        images: ['img2.jpg'],
        price: 50,
        picupLocation: 'Library',
        catagory: 'books',
        sold: false,
        owner: dummyOwnerId,
      },
      {
        productName: 'Microwave Oven',
        description: 'Works great',
        details: '700W',
        images: ['img3.jpg'],
        price: 40,
        picupLocation: 'Dorm B',
        catagory: 'appliances',
        sold: false,
        owner: dummyOwnerId,
      },
      {
        productName: 'Lab Coat & Drafter',
        description: 'Engineering gear',
        details: 'Size L',
        images: ['img4.jpg'],
        price: 30,
        picupLocation: 'Engg Block',
        catagory: 'engineering',
        sold: false,
        owner: dummyOwnerId,
      },
      {
        productName: 'Study Desk',
        description: 'Wooden desk',
        details: '4ft x 2ft',
        images: ['img5.jpg'],
        price: 80,
        picupLocation: 'Dorm A',
        catagory: 'furnature', // Matches controller query spelling
        sold: false,
        owner: dummyOwnerId,
      },
      {
        productName: 'Gaming Headphones',
        description: 'Noise cancelling',
        details: 'Bluetooth',
        images: ['img6.jpg'],
        price: 60,
        picupLocation: 'Campus B',
        catagory: 'electronics',
        sold: true, // Sold product (should be filtered out by listed endpoints)
        owner: dummyOwnerId,
      },
    ]);
  };

  describe('GET /api/listed', () => {
    it('should return all unsold products (status 200)', async () => {
      await seedProducts();

      const response = await request(app).get('/api/listed');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('listed');
      expect(Array.isArray(response.body.listed)).toBe(true);
      expect(response.body.listed.length).toBe(5); // 5 unsold products
      
      // Ensure no sold products are returned
      const hasSoldItem = response.body.listed.some((item) => item.sold === true);
      expect(hasSoldItem).toBe(false);
    });

    it('should return an empty array if no products exist', async () => {
      const response = await request(app).get('/api/listed');

      expect(response.statusCode).toBe(200);
      expect(response.body.listed).toEqual([]);
    });
  });

  describe('GET /api/listed/electronics', () => {
    it('should fetch only unsold electronics products', async () => {
      await seedProducts();

      const response = await request(app).get('/api/listed/electronics');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('electronics');
      expect(response.body.electronics.length).toBe(1); // Excludes the sold electronic item
      expect(response.body.electronics[0].productName).toBe('iPhone 13');
      expect(response.body.electronics[0].catagory).toBe('electronics');
    });
  });

  describe('GET /api/listed/books', () => {
    it('should fetch only unsold books products', async () => {
      await seedProducts();

      const response = await request(app).get('/api/listed/books');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('books');
      expect(response.body.books.length).toBe(1);
      expect(response.body.books[0].productName).toBe('Calculus Textbook');
      expect(response.body.books[0].catagory).toBe('books');
    });
  });

  describe('GET /api/listed/appliences', () => {
    it('should fetch only unsold appliances products', async () => {
      await seedProducts();

      const response = await request(app).get('/api/listed/appliences');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('appliences');
      expect(response.body.appliences.length).toBe(1);
      expect(response.body.appliences[0].productName).toBe('Microwave Oven');
    });
  });

  describe('GET /api/listed/engineering', () => {
    it('should fetch only unsold engineering products', async () => {
      await seedProducts();

      const response = await request(app).get('/api/listed/engineering');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('engineering');
      expect(response.body.engineering.length).toBe(1);
      expect(response.body.engineering[0].productName).toBe('Lab Coat & Drafter');
    });
  });

  describe('GET /api/listed/furniture', () => {
    it('should fetch only unsold furniture products', async () => {
      await seedProducts();

      const response = await request(app).get('/api/listed/furniture');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('furniture');
      expect(response.body.furniture.length).toBe(1);
      expect(response.body.furniture[0].productName).toBe('Study Desk');
    });
  });

  describe('GET /api/listed/search', () => {
    it('should return matching products case-insensitively using search query', async () => {
      await seedProducts();

      // Search for "phone"
      const response = await request(app)
        .get('/api/listed/search')
        .query({ searchString: 'phone' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body.results.length).toBe(2); // "iPhone 13" and "Gaming Headphones"
    });

    it('should return empty results if search string matches nothing', async () => {
      await seedProducts();

      const response = await request(app)
        .get('/api/listed/search')
        .query({ searchString: 'NonExistentProduct' });

      expect(response.statusCode).toBe(200);
      expect(response.body.results).toEqual([]);
    });
  });
});