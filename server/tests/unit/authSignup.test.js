/* global jest, describe, beforeEach, it, expect */
// 1. CommonJS Imports (No Babel needed)
const { authSignup } = require('../../controllers/userController'); // Adjust path
const UserModel = require('../../models/userModel');    // Adjust path
const generateToken = require('../../config/generateToken'); // Adjust path
const { LocalStorage } = require('node-localstorage');

// 2. Mock External Dependencies
jest.mock('../../models/userModel');
jest.mock('../../config/generateToken');
jest.mock('node-localstorage');

describe('authSignup Controller', () => {
  let req, res, mockLocalStorage;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock Express Request & Response objects
    req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock LocalStorage instance methods
    mockLocalStorage = {
      setItem: jest.fn(),
    };
    LocalStorage.mockImplementation(() => mockLocalStorage);
  });

  // Test Case 1: Missing Required Fields
  it('should return 400 if any required field is missing', async () => {
    req.body = { email: 'john@example.com' }; // Missing name & password

    await authSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'credentials are needed !',
    });
  });

  // Test Case 2: User Already Exists
  it('should return 400 if user with email already exists', async () => {
    UserModel.findOne.mockResolvedValue({ _id: '123', email: 'john@example.com' });

    await authSignup(req, res);

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'user with credential exists',
    });
  });

  // Test Case 3: Successful Signup
  it('should create a new user and return 201 with user data and token', async () => {
    const mockNewUser = {
      _id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      pic: 'default.png',
    };

    UserModel.findOne.mockResolvedValue(null);
    UserModel.create.mockResolvedValue(mockNewUser);
    generateToken.mockReturnValue('fake_jwt_token');

    await authSignup(req, res);

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(UserModel.create).toHaveBeenCalledWith(req.body);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_name', 'John Doe');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_ID', 'user_123');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      pic: 'default.png',
      token: 'fake_jwt_token',
    });
  });

  // Test Case 4: Database Failure to Create User
  it('should return 400 if user creation fails', async () => {
    UserModel.findOne.mockResolvedValue(null);
    UserModel.create.mockResolvedValue(null);

    await authSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to craeate user !',
    });
  });
});