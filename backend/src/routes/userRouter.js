import express from 'express';
import controller from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', auth, controller.getProfile);

router.post('/image', auth, controller.postProfileImage);
router.post('/register', controller.register);
router.post('/login', controller.login);

export default router;