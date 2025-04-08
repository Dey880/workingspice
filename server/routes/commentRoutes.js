const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const verifyJwt = require('../middleware/verifyJwt');

// All comment routes require authentication
router.use(verifyJwt);

// CRUD operations for comments
router.post('/', commentController.createComment);
router.get('/ticket/:ticketId', commentController.getTicketComments);
router.get('/:id', commentController.getCommentById);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;