const { 
  getWishlist, 
  getListed, 
  getPurchases, 
  getSold 
} = require('../../controllers/profileControlllers'); // Adjust path
const productModel = require('../../models/productModel');// Adjust path
const userModel = require('../../models/userModel');// Adjust path

// Mock the Mongoose models
jest.mock('../../models/productModel');
jest.mock('../../models/userModel');

describe('User Products Controllers', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { id: 'user_123' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  // ==========================================
  // Tests for getWishlist
  // ==========================================
  describe('getWishlist', () => {
    it('should return wishlist array with status 200 on success', async () => {
      const mockUser = {
        _id: 'user_123',
        wishlist: [{ _id: 'prod_1', productName: 'Phone' }],
      };
      userModel.findOne.mockResolvedValue(mockUser);

      await getWishlist(req, res);

      expect(userModel.findOne).toHaveBeenCalledWith({ _id: 'user_123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser.wishlist);
    });

    it('should set status 400 and throw error when database query fails', async () => {
      userModel.findOne.mockRejectedValue(new Error('User query failed'));

      await expect(getWishlist(req, res)).rejects.toThrow('User query failed');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ==========================================
  // Tests for getListed
  // ==========================================
  describe('getListed', () => {
    it('should return user listed products with status 200', async () => {
      const mockProducts = [{ _id: 'prod_1', productName: 'Laptop', owner: 'user_123' }];
      productModel.find.mockResolvedValue(mockProducts);

      await getListed(req, res);

      expect(productModel.find).toHaveBeenCalledWith({ owner: 'user_123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should set status 400 and throw error on failure', async () => {
      productModel.find.mockRejectedValue(new Error('Product query failed'));

      await expect(getListed(req, res)).rejects.toThrow('Product query failed');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ==========================================
  // Tests for getPurchases
  // ==========================================
  describe('getPurchases', () => {
    it('should return user purchases with status 200', async () => {
      const mockProducts = [{ _id: 'prod_2', productName: 'Headphones', sold: true }];
      
      // Mocking query chaining: productModel.find().populate()
      const mockPopulate = jest.fn().mockResolvedValue(mockProducts);
      productModel.find.mockReturnValue({ populate: mockPopulate });

      await getPurchases(req, res);

      expect(productModel.find).toHaveBeenCalledWith(
        { sold: true },
        { 'paymentDetails.coustomer_id': 'user_123' }
      );
      expect(mockPopulate).toHaveBeenCalledWith('owner');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should set status 400 and throw error on failure', async () => {
      productModel.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(getPurchases(req, res)).rejects.toThrow('Database error');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ==========================================
  // Tests for getSold
  // ==========================================
  describe('getSold', () => {
    it('should return sold products with status 200', async () => {
      const mockProducts = [{ _id: 'prod_3', productName: 'Camera', sold: true }];
      productModel.find.mockResolvedValue(mockProducts);

      await getSold(req, res);

      expect(productModel.find).toHaveBeenCalledWith(
        { sold: true },
        { owner: 'user_123' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockProducts);
    });

    it('should set status 400 and throw error on failure', async () => {
      productModel.find.mockRejectedValue(new Error('Fetch sold failed'));

      await expect(getSold(req, res)).rejects.toThrow('Fetch sold failed');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});