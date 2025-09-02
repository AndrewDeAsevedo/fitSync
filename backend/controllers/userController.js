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
  const { id } = req.params;
  const user = await getUserById(id);
  res.json(user);
};


module.exports = { getAllUsersController, createUserController, getUserByIdController };
