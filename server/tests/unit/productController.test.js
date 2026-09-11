const { 
  getProductDetails,
  updateProductDetails 
} = require('../../controllers/productController'); // Adjust path
const Product = require('../../models/productModel'); // Adjust path

// Mock the Product model
jest.mock('../../models/productModel');

describe('Product Details Controllers', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { id: 'prod_123' },
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  // ==========================================
  // Tests for getProductDetails
  // ==========================================
  describe('getProductDetails', () => {
    it('should return product details with status 200 on success', async () => {
      const mockProduct = { _id: 'prod_123', productName: 'Laptop', price: 500 };
      Product.findOne.mockResolvedValue(mockProduct);

      await getProductDetails(req, res);

      expect(Product.findOne).toHaveBeenCalledWith({ _id: 'prod_123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should handle errors and set status 400 when database query fails', async () => {
      Product.findOne.mockRejectedValue(new Error('Database error'));

      await expect(getProductDetails(req, res)).rejects.toThrow('Database error');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ==========================================
  // Tests for updateProductDetails
  // ==========================================
  describe('updateProductDetails', () => {
    it('should update product and return 200 on success', async () => {
      req.body = { cardType: 'Visa', amount: 500 };
      const mockUpdatedProduct = {
        _id: 'prod_123',
        sold: true,
        paymentDetails: req.body,
      };

      Product.findByIdAndUpdate.mockResolvedValue(mockUpdatedProduct);

      await updateProductDetails(req, res);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        'prod_123',
        { sold: true, paymentDetails: req.body },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedProduct);
    });

    it('should return 404 if product to update is not found', async () => {
      Product.findByIdAndUpdate.mockResolvedValue(null);

      await updateProductDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Product not found');
    });

    it('should return 500 when an internal server error occurs', async () => {
      Product.findByIdAndUpdate.mockRejectedValue(new Error('Database crash'));

      await updateProductDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});