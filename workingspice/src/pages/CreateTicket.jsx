import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateTicket() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/tickets`, 
                {
                    title,
                    description,
                    priority
                },
                { withCredentials: true }
            );
            
            // Redirect to the new ticket page
            navigate(`/tickets/${response.data.ticket._id}`);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error creating ticket');
            setLoading(false);
        }
    };

    return (
        <div className="create-ticket">
            <h1>Create New Ticket</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Brief description of the issue"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        placeholder="Detailed explanation of the issue"
                        rows="5"
                    ></textarea>
                </div>
                
                <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
                
                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Ticket'}
                    </button>
                </div>
            </form>
        </div>
    );
}