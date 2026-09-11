/* global jest, describe, beforeEach, it, expect */
// 1. CommonJS Imports (No Babel needed)
const { authSignin } = require('../../controllers/userController'); // Adjust path
const UserModel = require('../../models/userModel');    // Adjust path
const generateToken = require('../../config/generateToken'); // Adjust path
const { LocalStorage } = require('node-localstorage');

// 2. Mock External Dependencies
jest.mock('../../models/userModel');
jest.mock('../../config/generateToken');
jest.mock('node-localstorage');

describe('authSignin Controller', () => {
  let req, res, mockLocalStorage;

  beforeEach(() => {
    // Reset mocks before each test run
    jest.clearAllMocks();

    // Mock Express Request & Response objects
    req = {
      body: {
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
      getItem: jest.fn(),
    };
    LocalStorage.mockImplementation(() => mockLocalStorage);
  });

  // Test Case 1: Missing Fields
  it('should return 400 if email or password is missing', async () => {
    req.body = { email: 'john@example.com' }; // Password missing

    await authSignin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'credentials not provideded !!',
    });
  });

  // Test Case 2: User Not Found
  it('should return 400 if user does not exist in database', async () => {
    UserModel.findOne.mockResolvedValue(null);

    await authSignin(req, res);

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'invalid credentials !!',
    });
  });

  // Test Case 3: Invalid Password
  it('should return 400 if password does not match', async () => {
    const mockUser = {
      _id: 'user_123',
      email: 'john@example.com',
      matchPassword: jest.fn().mockResolvedValue(false), // Password mismatch
    };

    UserModel.findOne.mockResolvedValue(mockUser);

    await authSignin(req, res);

    expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'invalid credentials !!',
    });
  });

  // Test Case 4: Successful Signin
  it('should return user details and token on successful signin', async () => {
    const mockUser = {
      _id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      isAdmin: false,
      pic: 'default.png',
      matchPassword: jest.fn().mockResolvedValue(true), // Password matches
    };

    UserModel.findOne.mockResolvedValue(mockUser);
    generateToken.mockReturnValue('fake_jwt_token');

    await authSignin(req, res);

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_name', 'John Doe');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_ID', 'user_123');
    expect(res.json).toHaveBeenCalledWith({
      _id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      isAdmin: false,
      pic: 'default.png',
      token: 'fake_jwt_token',
    });
  });
});