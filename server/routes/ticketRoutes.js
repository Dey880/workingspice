const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const verifyJwt = require('../middleware/verifyJwt');

router.use(verifyJwt); // Apply middleware to all routes

// Place specific routes BEFORE parameter routes
router.get('/user', ticketController.getUserTickets); // Get current user's tickets
router.get('/', ticketController.getAllTickets);
router.post('/', ticketController.createTicket);

// Parameter routes must come after specific routes
router.get('/:id', ticketController.getTicketById);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;