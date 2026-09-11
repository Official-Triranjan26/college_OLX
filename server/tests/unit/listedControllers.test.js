const {
  getAllListed,
  getAllElectronics,
  getAllBooks,
  getAllAppliences,
  getAllEngineering,
  getAllFurniture,
  getItemsFromSearchString,
} = require('../../controllers/listedControllers'); // Adjust path
const Product = require('../../models/productModel'); // Adjust path

// Mock the Product model
jest.mock('../../models/productModel');

describe('Product Category Controllers', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // ==========================================
  // Tests for getAllListed
  // ==========================================
  describe('getAllListed', () => {
    it('should return all unsold products with status 200', async () => {
      const mockListed = [{ _id: 'prod_1', productName: 'Item 1', sold: false }];
      Product.find.mockResolvedValue(mockListed);

      await getAllListed(req, res);

      expect(Product.find).toHaveBeenCalledWith({ sold: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ listed: mockListed });
    });

    it('should set status 400 and throw error on failure', async () => {
      Product.find.mockRejectedValue(new Error('Database error'));

      await expect(getAllListed(req, res)).rejects.toThrow('Database error');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ==========================================
  // Tests for getAllElectronics
  // ==========================================
  describe('getAllElectronics', () => {
    it('should return unsold electronics with status 200', async () => {
      const mockElectronics = [{ _id: 'prod_2', catagory: 'electronics', sold: false }];
      Product.find.mockResolvedValue(mockElectronics);

      await getAllElectronics(req, res);

      expect(Product.find).toHaveBeenCalledWith({ catagory: 'electronics', sold: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ electronics: mockElectronics });
    });

    it('should set status 400 and throw error on failure', async () => {
      Product.find.mockRejectedValue(new Error('Database error'));

      await expect(getAllElectronics(req, res)).rejects.toThrow('Database error');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ==========================================
  // Tests for getAllBooks
  // ==========================================
  describe('getAllBooks', () => {
    it('should return unsold books with status 200', async () => {
      const mockBooks = [{ _id: 'prod_3', catagory: 'books', sold: false }];
      Product.find.mockResolvedValue(mockBooks);

      await getAllBooks(req, res);

      expect(Product.find).toHaveBeenCalledWith({ catagory: 'books', sold: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ books: mockBooks });
    });

    it('should set status 400 and throw error on failure', async () => {
      Product.find.mockRejectedValue(new Error('Database error'));

      await expect(getAllBooks(req, res)).rejects.toThrow('Database error');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ==========================================
  // Tests for getAllAppliences
  // ==========================================
  describe('getAllAppliences', () => {
    it('should return unsold appliances with status 200', async () => {
      const mockAppliances = [{ _id: 'prod_4', catagory: 'appliances', sold: false }];
      Product.find.mockResolvedValue(mockAppliances);

      await getAllAppliences(req, res);

      expect(Product.find).toHaveBeenCalledWith({ catagory: 'appliances', sold: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ appliences: mockAppliances });
    });

    it('should set status 400 and throw error on failure', async () => {
      Product.find.mockRejectedValue(new Error('Database error'));

      await expect(getAllAppliences(req, res)).rejects.toThrow('Database error');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ==========================================
  // Tests for getAllEngineering
  // ==========================================
  describe('getAllEngineering', () => {
    it('should return unsold engineering products with status 200', async () => {
      const mockEngineering = [{ _id: 'prod_5', catagory: 'engineering', sold: false }];
      Product.find.mockResolvedValue(mockEngineering);

      await getAllEngineering(req, res);

      expect(Product.find).toHaveBeenCalledWith({ catagory: 'engineering', sold: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ engineering: mockEngineering });
    });

    it('should set status 400 and throw error on failure', async () => {
      Product.find.mockRejectedValue(new Error('Database error'));

      await expect(getAllEngineering(req, res)).rejects.toThrow('Database error');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ==========================================
  // Tests for getAllFurniture
  // ==========================================
  describe('getAllFurniture', () => {
    it('should return unsold furniture with status 200', async () => {
      const mockFurniture = [{ _id: 'prod_6', catagory: 'furnature', sold: false }];
      Product.find.mockResolvedValue(mockFurniture);

      await getAllFurniture(req, res);

      expect(Product.find).toHaveBeenCalledWith({ catagory: 'furnature', sold: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ furniture: mockFurniture });
    });

    it('should set status 400 and throw error on failure', async () => {
      Product.find.mockRejectedValue(new Error('Database error'));

      await expect(getAllFurniture(req, res)).rejects.toThrow('Database error');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ==========================================
  // Tests for getItemsFromSearchString
  // ==========================================
  describe('getItemsFromSearchString', () => {
    it('should return matched products based on search regex with status 200', async () => {
      req.query.searchString = 'phone';
      const mockResults = [{ _id: 'prod_7', productName: 'iPhone 13' }];
      Product.find.mockResolvedValue(mockResults);

      await getItemsFromSearchString(req, res);

      expect(Product.find).toHaveBeenCalledWith({
        productName: { $regex: new RegExp('phone', 'i') },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ results: mockResults });
    });

    it('should set status 400 and throw error on failure', async () => {
      req.query.searchString = 'phone';
      Product.find.mockRejectedValue(new Error('Search failed'));

      await expect(getItemsFromSearchString(req, res)).rejects.toThrow('Search failed');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});