import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function TicketDetail() {
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [user, setUser] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [supportLine, setSupportLine] = useState('first-line');
    const { id } = useParams();
    const navigate = useNavigate();

    // Function to fetch ticket data and comments
    const fetchTicketData = async () => {
        try {
            // Get ticket details
            const ticketResponse = await axios.get(`${import.meta.env.VITE_API_URL}/tickets/${id}`, { 
                withCredentials: true 
            });
            setTicket(ticketResponse.data.ticket);

            // Get ticket comments
            const commentsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/comments/ticket/${id}`, {
                withCredentials: true
            });
            setComments(commentsResponse.data.comments);
        } catch (err) {
            console.error("Error refreshing ticket data:", err);
            // Only set error if it's the initial load
            if (loading) {
                setError(err.response?.data?.msg || 'Error loading ticket details');
                // Redirect to login if unauthorized
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            }
        }
    };

    // Initial data load
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Get current user info
                const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, { 
                    withCredentials: true 
                });
                setUser(userResponse.data.user);
                setCurrentUser(userResponse.data.user);

                // If user is admin, fetch admin list
                if (userResponse.data.user.role === 'admin') {
                    const adminsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/auth/admins`, {
                        withCredentials: true
                    });
                    setAdmins(adminsResponse.data.admins);
                }

                // Fetch ticket and comments
                await fetchTicketData();
            } catch (err) {
                setError(err.response?.data?.msg || 'Error loading ticket details');
                // Redirect to login if unauthorized
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id, navigate]);

    // Set up polling interval to refresh data
    useEffect(() => {
        // Only set up polling after initial load is complete
        if (!loading && !error) {
            const intervalId = setInterval(() => {
                fetchTicketData();
            }, 10000); // Refresh every 10 seconds
            
            // Clean up interval on component unmount
            return () => clearInterval(intervalId);
        }
    }, [loading, error, id]);

    // Add new comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        
        // Check if ticket is closed
        if (ticket.status === 'closed') {
            setError('Cannot add comments to closed tickets');
            return;
        }
        
        if (!newComment.trim()) return;
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/comments`, {
                content: newComment,
                ticketId: id
            }, { withCredentials: true });
            
            // Add new comment to the list
            setComments([response.data.comment, ...comments]);
            
            // Clear the comment input
            setNewComment('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error adding comment');
        }
    };

    // Handle status update (for admins)
    const handleStatusUpdate = async (newStatus) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/tickets/${id}`, {
                status: newStatus
            }, { withCredentials: true });
            
            setTicket(response.data.ticket);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error updating ticket status');
        }
    };

    // Handle assigning ticket to admin
    const handleAssignTicket = async (e) => {
        const assignedToId = e.target.value;
        
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/tickets/${id}`, {
                assignedTo: assignedToId === "unassigned" ? null : assignedToId
            }, { withCredentials: true });
            
            setTicket(response.data.ticket);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error assigning ticket');
        }
    };

    // Handle ticket update (for admins)
    const handleTicketUpdate = async (field, value) => {
        // Don't update if value is empty or unchanged
        if (!value || value === ticket[field]) return;
        
        try {
            const updateData = { [field]: value };
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/tickets/${id}`,
                updateData,
                { withCredentials: true }
            );
            
            setTicket(response.data.ticket);
            
            // Reset the edit fields
            if (field === 'title') setEditTitle('');
            if (field === 'description') setEditDescription('');
            
        } catch (err) {
            setError(err.response?.data?.msg || `Error updating ticket ${field}`);
        }
    };

    if (loading) {
        return <div>Loading ticket details...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="ticket-detail">
            <h1>Ticket: {ticket.title}</h1>
            
            <div className="ticket-info">
                <p><strong>Status:</strong> {ticket.status}</p>
                <p><strong>Priority:</strong> {ticket.priority}</p>
                <p><strong>Created by:</strong> {ticket.createdBy.username}</p>
                <p><strong>Assigned to:</strong> {ticket.assignedTo ? ticket.assignedTo.username : 'Unassigned'}</p>
                <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
                {ticket.updatedAt && (
                    <p><strong>Last Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>
                )}
            </div>
            
            <div className="ticket-description">
                <h2>Description</h2>
                <p>{ticket.description}</p>
            </div>
            
            {/* Admin actions */}
            {user?.role === 'admin' && (
                <div className="admin-actions">
                    <h3>Admin Actions</h3>
                    
                    {/* Assign to admin dropdown */}
                    <div className="assign-admin">
                        <label htmlFor="assign-admin">Assign to:</label>
                        <select 
                            id="assign-admin" 
                            value={ticket.assignedTo?._id || "unassigned"}
                            onChange={handleAssignTicket}
                        >
                            <option value="unassigned">Unassigned</option>
                            {admins.map(admin => (
                                <option key={admin._id} value={admin._id}>
                                    {admin.username}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Edit ticket properties */}
                    <div className="edit-ticket-properties">
                        <h3>Edit Ticket</h3>
                        
                        {/* Edit priority */}
                        <div className="edit-priority">
                            <label htmlFor="edit-priority">Priority:</label>
                            <select 
                                id="edit-priority" 
                                value={ticket.priority}
                                onChange={(e) => handleTicketUpdate('priority', e.target.value)}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        
                        {/* Edit title */}
                        <div className="edit-title">
                            <label htmlFor="edit-title">Title:</label>
                            <input
                                type="text"
                                id="edit-title"
                                value={editTitle || ticket.title}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                            <button onClick={() => handleTicketUpdate('title', editTitle)}>Update Title</button>
                        </div>
                        
                        {/* Edit description */}
                        <div className="edit-description">
                            <label htmlFor="edit-description">Description:</label>
                            <textarea
                                id="edit-description"
                                value={editDescription || ticket.description}
                                onChange={(e) => setEditDescription(e.target.value)}
                            ></textarea>
                            <button onClick={() => handleTicketUpdate('description', editDescription)}>Update Description</button>
                        </div>
                    </div>
                    
                    <h3>Update Status</h3>
                    <div className="status-buttons">
                        <button 
                            onClick={() => handleStatusUpdate('open')} 
                            disabled={ticket.status === 'open'}
                        >
                            Open
                        </button>
                        <button 
                            onClick={() => handleStatusUpdate('in-progress')} 
                            disabled={ticket.status === 'in-progress'}
                        >
                            In Progress
                        </button>
                        <button 
                            onClick={() => handleStatusUpdate('resolved')} 
                            disabled={ticket.status === 'resolved'}
                        >
                            Resolved
                        </button>
                        <button 
                            onClick={() => handleStatusUpdate('closed')} 
                            disabled={ticket.status === 'closed'}
                        >
                            Closed
                        </button>
                    </div>

                    {/* Support Level */}
                    {currentUser && ['admin'].includes(currentUser.role) && (
                        <div className="form-group">
                            <label htmlFor="supportLine">Support Level</label>
                            <select
                                id="supportLine"
                                value={supportLine}
                                onChange={(e) => setSupportLine(e.target.value)}
                                required
                            >
                                <option value="first-line">First Line Support</option>
                                <option value="second-line">Second Line Support</option>
                            </select>
                            <div className="field-hint">
                                Admin only: Assign this ticket to the appropriate support line
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Add comment form */}
            <div className="add-comment">
                <h2>Add Comment</h2>
                {ticket.status === 'closed' ? (
                    <p className="closed-ticket-message">This ticket is closed. No new comments can be added.</p>
                ) : (
                    <form onSubmit={handleAddComment}>
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your comment here..."
                            required
                        ></textarea>
                        <button type="submit">Add Comment</button>
                    </form>
                )}
            </div>
            
            {/* Comments list */}
            <div className="comments-section">
                <h2>Comments</h2>
                {comments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    <div className="comments-list">
                        {comments.map(comment => (
                            <div key={comment._id} className="comment">
                                <div className="comment-header">
                                    <strong>{comment.author.username}</strong>
                                    <span>{new Date(comment.createdAt).toLocaleString()}</span>
                                </div>
                                <p>{comment.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="back-button">
                <button onClick={() => navigate(-1)}>Back</button>
            </div>
        </div>
    );
}