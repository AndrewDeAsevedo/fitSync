const supabase = require("../config/supabaseClient.js");
const { getAllUsers, createUser, getUserById } = require('../models/User');

const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUserController = async (req, res) => {
  const { username, email } = req.body;
  try {
    const newUser = await createUser({ username, email });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// authentication

// Sign up
const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    res.status(201).json({ user: data.user, message: "Signup successful" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.json({ session: data.session, user: data.user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { 
  getAllUsersController, 
  createUserController, 
  getUserByIdController,
  signup,
  login
};
