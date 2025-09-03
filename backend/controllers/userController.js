const supabase = require("../config/supabaseClient.js");
const { getAllUsers, createUser, getUserById } = require('../models/User');
const { asyncHandler, AppError } = require('../middleware');

const getAllUsersController = async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
};

const createUserController = async (req, res) => {
  const { username, email } = req.body;
  
  // Check if user already exists
  const existingUser = await getUserById(email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }
  
  const newUser = await createUser({ username, email });
  res.status(201).json(newUser);
};

const getUserByIdController = async (req, res) => {
  const { id } = req.params;
  const user = await getUserById(id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.json(user);
};

// Authentication

// Sign up
const signup = async (req, res) => {
  const { email, password, adminCode } = req.body;

  // Check if this is an admin signup
  const isAdmin = adminCode === process.env.ADMIN_CODE;
  
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        role: isAdmin ? 'admin' : 'user',
        username: email.split('@')[0] // Default username from email
      }
    }
  });
  
  if (error) throw new AppError(error.message, 400);
  
  res.status(201).json({ 
    user: data.user, 
    message: isAdmin ? "Admin signup successful" : "Signup successful",
    role: isAdmin ? 'admin' : 'user'
  });
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new AppError(error.message, 401);
  
  res.json({ 
    session: data.session, 
    user: data.user,
    message: "Login successful"
  });
};

// Get current user profile
const getProfile = async (req, res) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }
  
  res.json({ 
    user: req.user,
    message: "Profile retrieved successfully"
  });
};

// Update user profile
const updateProfile = async (req, res) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }
  
  const { username, email } = req.body;
  
  // Update user metadata in Supabase
  const { data, error } = await supabase.auth.updateUser({
    data: { username, email }
  });
  
  if (error) throw new AppError(error.message, 400);
  
  res.json({ 
    user: data.user,
    message: "Profile updated successfully"
  });
};

// Create admin user (admin only)
const createAdmin = async (req, res) => {
  const { email, password, username } = req.body;
  
  // This route is already protected by requireRole('admin')
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      username: username || email.split('@')[0]
    }
  });
  
  if (error) throw new AppError(error.message, 400);
  
  res.status(201).json({ 
    user: data.user,
    message: "Admin user created successfully"
  });
};

// Promote user to admin (admin only)
const promoteToAdmin = async (req, res) => {
  const { userId } = req.params;
  
  // This route is already protected by requireRole('admin')
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      role: 'admin'
    }
  });
  
  if (error) throw new AppError(error.message, 400);
  
  res.json({ 
    user: data.user,
    message: "User promoted to admin successfully"
  });
};

module.exports = { 
  getAllUsersController, 
  createUserController, 
  getUserByIdController,
  signup,
  login,
  getProfile,
  updateProfile,
  createAdmin,
  promoteToAdmin
};
