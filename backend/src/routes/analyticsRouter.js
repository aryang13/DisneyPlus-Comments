import express from 'express';
import controller from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/similar-users', controller.getSimilarUsers);
router.get('/top-commenter', controller.getTopCommenter);
router.get('/reviews-per-user', controller.getReviewsPerUser);

export default router;