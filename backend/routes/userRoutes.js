const express = require('express');
const router = express.Router();
const { getAllUsersController, createUserController, getUserByIdController } = require('../controllers/userController');

router.get('/', getAllUsersController);
router.post('/', createUserController);
router.get('/:id', getUserByIdController);

module.exports = router;
