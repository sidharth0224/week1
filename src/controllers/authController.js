const UserModel = require('../models/userModel');
const { generateToken } = require('../middleware/authMiddleware');
const { ApiError } = require('../middleware/errorHandler');
const { z } = require('zod');

const signupSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

/**
 * POST /api/v1/auth/signup
 */
async function signup(req, res, next) {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      const details = parseResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
      throw new ApiError(400, 'Validation error', 'VALIDATION_ERROR', details);
    }

    const { username, email, password } = parseResult.data;

    // Check email uniqueness
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'An account with this email address already exists.', 'EMAIL_EXISTS');
    }

    const newUser = await UserModel.create({ username, email, password });
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: newUser,
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/login
 */
async function login(req, res, next) {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const details = parseResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
      throw new ApiError(400, 'Validation error', 'VALIDATION_ERROR', details);
    }

    const { email, password } = parseResult.data;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    const isMatch = await UserModel.verifyPassword(password, user.password_hash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/me (Protected)
 */
async function getMe(req, res, next) {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      throw new ApiError(44, 'User profile not found.', 'NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: user
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  login,
  getMe
};
