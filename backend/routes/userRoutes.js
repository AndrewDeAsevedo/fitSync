const express = require('express');
const router = express.Router();
const { getAllUsersController, createUserController, getUserByIdController, signup, login } = require('../controllers/userController');

router.get('/', getAllUsersController);
router.post('/', createUserController);
router.get('/:id', getUserByIdController);

// authentication

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
