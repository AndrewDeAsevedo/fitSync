const { getAllUsers, createUser } = require('../models/User');

const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUserController = async (req, res) => {
  const { name, email } = req.body;
  try {
    const newUser = await createUser({ name, email });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAllUsersController, createUserController };
