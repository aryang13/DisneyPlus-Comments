import express from 'express';
import controller from '../controllers/forumController.js';

const router = express.Router();

//get all forums and which ones a user is a part of
router.get('/', controller.getForums);

// creating forums
router.post('/create', controller.createForum);

// joining forums,
router.post('/join', controller.joinForum);

export default router;