const router= require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');
router.get('/login', authController.login);
router.get('/callback', authController.callback);
router.get('/me', authMiddleware, authController.getMe);
module.exports = router;