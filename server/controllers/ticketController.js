const Ticket = require("../models/Ticket");
const User = require("../models/User");

const ticketController = {
  createTicket: async (req, res) => {
    try {
      const { title, description, priority, assignedTo } = req.body;

      const ticket = new Ticket({
        title,
        description,
        priority: priority || "choose priority",
        createdBy: req.user.id,
        assignedTo: assignedTo || null,
      });

      await ticket.save();
      res.status(201).json({ msg: "Ticket created successfully", ticket });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  // Get all tickets or filter by support line
  getAllTickets: async (req, res) => {
    try {
      // Build query based on parameters
      const query = {};
      
      // Add supportLine filter if provided
      if (req.query.supportLine) {
        query.supportLine = req.query.supportLine;
      }
      
      // First line and second line users can only see tickets assigned to their line
      if (req.user.role === 'first-line') {
        query.supportLine = 'first-line';
      } else if (req.user.role === 'second-line') {
        query.supportLine = 'second-line';
      }
      
      // Get tickets with populated references
      const tickets = await Ticket.find(query)
        .populate('createdBy', 'username email')
        .populate('assignedTo', 'username email')
        .sort({ createdAt: -1 });
        
      res.status(200).json({ tickets });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  // Get a specific ticket by ID
  getTicketById: async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id)
        .populate("createdBy", "username email")
        .populate("assignedTo", "username email");

      if (!ticket) {
        return res.status(404).json({ msg: "Ticket not found" });
      }

      res.status(200).json({ ticket });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  // Update a ticket
  updateTicket: async (req, res) => {
    try {
      const { title, description, status, priority, assignedTo } = req.body;

      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({ msg: "Ticket not found" });
      }

      // Check if user is authorized (creator, admin, or appropriate line support)
      if (
        ticket.createdBy.toString() !== req.user.id.toString() &&
        req.user.role !== "admin" &&
        !(req.user.role === "first-line" && ticket.supportLine === "first-line") &&
        !(req.user.role === "second-line" && ticket.supportLine === "second-line")
      ) {
        return res
          .status(403)
          .json({ msg: "Not authorized to update this ticket" });
      }

      if (
        !['admin', 'admin'].includes(req.user.role) && 
        req.body.supportLine
      ) {
        // If not admin, remove supportLine from the update fields
        delete req.body.supportLine;
      }

      const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id,
        {
          title: title || ticket.title,
          description: description || ticket.description,
          status: status || ticket.status,
          priority: priority || ticket.priority,
          assignedTo: assignedTo || ticket.assignedTo,
          updatedAt: Date.now(),
        },
        { new: true }
      )
        .populate("createdBy", "username email")
        .populate("assignedTo", "username email");

      res
        .status(200)
        .json({ msg: "Ticket updated successfully", ticket: updatedTicket });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  // Delete a ticket
  deleteTicket: async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      console.log(ticket)
      
      if (!ticket) {
        return res.status(404).json({ msg: "Ticket not found" });
      }
      
      // Check if user is authorized (creator, admin, or appropriate line support)
      if (
        ticket.createdBy.toString() !== req.user.id.toString() &&
        req.user.role !== "admin" &&
        !(req.user.role === "first-line" && ticket.supportLine === "first-line") &&
        !(req.user.role === "second-line" && ticket.supportLine === "second-line")
      ) {
        return res
        .status(403)
        .json({ msg: "Not authorized to delete this ticket" });
      }

      await Ticket.findByIdAndDelete(req.params.id);

      res.status(200).json({ msg: "Ticket deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  // Get tickets for current user
  getUserTickets: async (req, res) => {
    try {
      // For regular users: only tickets they created
      // For admins: can include assigned tickets as well
      const query = { createdBy: req.user.id };
      
      // If user is admin, also get tickets assigned to them
      if (req.user.role === 'admin') {
        query.$or = [
          { createdBy: req.user.id }, 
          { assignedTo: req.user.id }
        ];
      }
      
      const tickets = await Ticket.find(query)
        .populate("createdBy", "username email")
        .populate("assignedTo", "username email");

      res.status(200).json({ tickets });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
};

module.exports = ticketController;