const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');

const commentController = {
  // Create a new comment
  createComment: async (req, res) => {
    try {
      const { content, ticketId } = req.body;
      
      // Check if the ticket exists
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ msg: "Ticket not found" });
      }
      
      const comment = new Comment({
        content,
        ticket: ticketId,
        author: req.user.id,
      });
      
      await comment.save();
      
      // Populate author information
      const populatedComment = await Comment.findById(comment._id).populate('author', 'username email');
      
      res.status(201).json({ msg: "Comment created successfully", comment: populatedComment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  // Get all comments for a ticket
  getTicketComments: async (req, res) => {
    try {
      const { ticketId } = req.params;
      
      // Check if the ticket exists
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ msg: "Ticket not found" });
      }
      
      const comments = await Comment.find({ ticket: ticketId })
        .populate('author', 'username email')
        .sort({ createdAt: -1 });
      
      res.status(200).json({ comments });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  // Get a specific comment by ID
  getCommentById: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id)
        .populate('author', 'username email')
        .populate('ticket');
      
      if (!comment) {
        return res.status(404).json({ msg: "Comment not found" });
      }
      
      res.status(200).json({ comment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  // Update a comment
  updateComment: async (req, res) => {
    try {
      const { content } = req.body;
      
      const comment = await Comment.findById(req.params.id);
      
      if (!comment) {
        return res.status(404).json({ msg: "Comment not found" });
      }
      
      // Check if user is authorized (admin or comment author)
      if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ msg: "Not authorized to update this comment" });
      }
      
      const updatedComment = await Comment.findByIdAndUpdate(
        req.params.id,
        {
          content: content || comment.content,
        },
        { new: true }
      ).populate('author', 'username email');
      
      res.status(200).json({ msg: "Comment updated successfully", comment: updatedComment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  // Delete a comment
  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      
      if (!comment) {
        return res.status(404).json({ msg: "Comment not found" });
      }
      
      // Check if user is authorized (admin or comment author)
      if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ msg: "Not authorized to delete this comment" });
      }
      
      await Comment.findByIdAndDelete(req.params.id);
      
      res.status(200).json({ msg: "Comment deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
};

module.exports = commentController;