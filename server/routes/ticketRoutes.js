const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const verifyJwt = require('../middleware/verifyJwt');

router.use(verifyJwt);

router.post('/', ticketController.createTicket);
router.get('/', ticketController.getAllTickets);
router.get('/:id', ticketController.getTicketById);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;