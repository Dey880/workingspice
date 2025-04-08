import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // Track active tab
    const navigate = useNavigate();

    // Fetch current user and their tickets
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get current user info
                const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, { 
                    withCredentials: true 
                });
                setUser(userResponse.data.user);

                // Fetch tickets for this user
                const ticketsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/tickets/user`, { 
                    withCredentials: true 
                });
                setTickets(ticketsResponse.data.tickets);
            } catch (err) {
                setError(err.response?.data?.msg || 'Error loading profile');
                // Redirect to login if unauthorized
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Same filtering and sorting logic as Dashboard
    const getFilteredTickets = () => {
        let filteredTickets = tickets;
        if (activeTab !== 'all') {
            filteredTickets = tickets.filter(ticket => ticket.status === activeTab);
        }
        
        return filteredTickets.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    };

    const getTicketCounts = () => {
        const counts = {
            all: tickets.length,
            open: 0,
            'in-progress': 0,
            resolved: 0,
            closed: 0
        };
        
        tickets.forEach(ticket => {
            if (counts[ticket.status] !== undefined) {
                counts[ticket.status]++;
            }
        });
        
        return counts;
    };

    const ticketCounts = getTicketCounts();
    const filteredTickets = getFilteredTickets();

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="profile">
            <h1>User Profile</h1>
            <p>Welcome, {user?.username}!</p>
            
            <button className="create-ticket-button" onClick={() => navigate('/create-ticket')}>
                Create New Ticket
            </button>
            
            <h2>Your Tickets</h2>
            
            {/* Status tabs - same as Dashboard */}
            <div className="status-tabs">
                <button 
                    className={activeTab === 'all' ? 'active' : ''} 
                    onClick={() => setActiveTab('all')}
                >
                    All Tickets <span className="badge">{ticketCounts.all}</span>
                </button>
                <button 
                    className={activeTab === 'open' ? 'active' : ''} 
                    onClick={() => setActiveTab('open')}
                >
                    Open <span className="badge">{ticketCounts.open}</span>
                </button>
                <button 
                    className={activeTab === 'in-progress' ? 'active' : ''} 
                    onClick={() => setActiveTab('in-progress')}
                >
                    In Progress <span className="badge">{ticketCounts['in-progress']}</span>
                </button>
                <button 
                    className={activeTab === 'resolved' ? 'active' : ''} 
                    onClick={() => setActiveTab('resolved')}
                >
                    Resolved <span className="badge">{ticketCounts.resolved}</span>
                </button>
                <button 
                    className={activeTab === 'closed' ? 'active' : ''} 
                    onClick={() => setActiveTab('closed')}
                >
                    Closed <span className="badge">{ticketCounts.closed}</span>
                </button>
            </div>
            
            {/* Tickets list - same structure as Dashboard */}
            {filteredTickets.length === 0 ? (
                <p>No tickets available in this category.</p>
            ) : (
                <div className="tickets-list">
                    {filteredTickets.map(ticket => (
                        <div key={ticket._id} className="ticket-card">
                            <div className={`priority-indicator ${ticket.priority}`}></div>
                            <h3>{ticket.title}</h3>
                            <p><strong>Status:</strong> <span className={`status ${ticket.status}`}>{ticket.status}</span></p>
                            <p><strong>Priority:</strong> <span className={`priority ${ticket.priority}`}>{ticket.priority}</span></p>
                            <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
                            <button onClick={() => navigate(`/tickets/${ticket._id}`)}>
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}