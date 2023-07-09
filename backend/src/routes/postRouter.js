import express from 'express';
import controller from '../controllers/postController.js';

const router = express.Router();

router.get('/episode-comments', controller.getEpisodeComments);
router.get('/forum-comments', controller.getForumComments);
router.get('/replies', controller.getReplies);
router.get('/reviews', controller.getReviews);

router.post('/episode-comment', controller.postEpisodeComment);
router.post('/forum-comment', controller.postForumComment);
router.post('/reply', controller.postReply);
router.post('/like', controller.postLike);
router.post('/review', controller.postReview);
router.post('/image-comment', controller.postImageComment);

router.patch('/episode-comment', controller.patchEpisodeComment);
router.patch('/forum-comment', controller.patchForumComment);
router.patch('/reply', controller.patchReply);
router.patch('/review', controller.patchReview);

router.delete('/episode-comment/:commentid', controller.deleteEpisodeComment);
router.delete('/forum-comment/:commentid', controller.deleteForumComment);
router.delete('/reply/:commentid', controller.deleteReply);
router.delete('/like/:commentid', controller.deleteLike);
router.delete('/review/:reviewid', controller.deleteReview);

export default router;
