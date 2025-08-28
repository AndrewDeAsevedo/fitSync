const express = require('express');
const router = express.Router();
const { getAllUsersController, createUserController } = require('../controllers/userController');

router.get('/', getAllUsersController);
router.post('/', createUserController);

module.exports = router;
