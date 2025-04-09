import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

export default function CreateTicket() {
    const { settings, loading } = useSettings();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium'); // Default
    const [category, setCategory] = useState('');
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Update priority when settings load
    useEffect(() => {
        if (!loading && settings.defaultTicketPriority) {
            setPriority(settings.defaultTicketPriority);
        }
    }, [settings.defaultTicketPriority, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingSubmit(true);
        setError(null);
        
        try {
            const ticketData = {
                title,
                description,
                priority,
                supportLine: 'first-line', // Default to first-line, only admins can change this
            };
            
            // Add category if enabled
            if (settings.ticketCategoriesEnabled && category) {
                ticketData.category = category;
            }
            
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/tickets`, 
                ticketData,
                { withCredentials: true }
            );
            
            // Redirect to the new ticket page
            navigate(`/tickets/${response.data.ticket._id}`);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error creating ticket');
            setLoadingSubmit(false);
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
                
                {settings.ticketCategoriesEnabled && settings.ticketCategories?.length > 0 && (
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="category-select"
                        >
                            <option value="">Select a category</option>
                            {settings.ticketCategories.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                )}
                
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
                
                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={loadingSubmit}
                    >
                        {loadingSubmit ? 'Creating...' : 'Create Ticket'}
                    </button>
                </div>
            </form>
        </div>
    );
}