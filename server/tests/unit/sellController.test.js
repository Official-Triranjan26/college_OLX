const sellProduct = require('../../controllers/sellController'); // Adjust path
const productModel = require('../../models/productModel');             // Adjust path
const { LocalStorage } = require('node-localstorage');

// Mock external dependencies
jest.mock('../../models/productModel');
jest.mock('node-localstorage');

describe('sellProduct Controller', () => {
  let req, res, mockLocalStorage;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        productName: 'Laptop',
        description: 'Used gaming laptop',
        details: '16GB RAM, 512GB SSD',
        images: ['img1.jpg'],
        price: 500,
        picupLocation: 'NY',
        catagory: 'Electronics',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('user_123'),
    };
    LocalStorage.mockImplementation(() => mockLocalStorage);
  });

  // Test Case 1: Missing Required Fields
  it('should return 400 if any required field is missing', async () => {
    req.body = { productName: 'Laptop' }; // Missing other required fields

    await sellProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'credentials not provideded !!',
    });
  });

  // Test Case 2: Successful Product Creation
  it('should create a product and return 201', async () => {
    const mockProduct = { _id: 'prod_123', ...req.body, owner: 'user_123' };
    productModel.create.mockResolvedValue(mockProduct);

    await sellProduct(req, res);

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user_ID');
    expect(productModel.create).toHaveBeenCalledWith({
      ...req.body,
      owner: 'user_123',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      messgae: 'success',
      data: mockProduct,
    });
  });

  // Test Case 3: Failed Product Creation
  it('should return 400 if product creation fails', async () => {
    productModel.create.mockResolvedValue(null);

    await sellProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      messgae: 'failed to add product',
    });
  });
});