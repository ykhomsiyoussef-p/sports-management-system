const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidationRules, loginValidationRules, handleValidationErrors } = require('../middleware/validators');

router.get('/login', authController.loginForm);
router.post('/login', loginValidationRules, handleValidationErrors, authController.login);

router.get('/register', authController.registerForm);
router.post('/register', registerValidationRules, handleValidationErrors, authController.register);

router.post('/logout', authController.logout);

module.exports = router;
