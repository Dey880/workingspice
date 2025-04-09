import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // Track active tab
    const navigate = useNavigate();

    // Fetch current user and tickets
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get current user info
                const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, { 
                    withCredentials: true 
                });
                setUser(userResponse.data.user);

                // Filter tickets based on role
                if (userResponse.data.user.role === 'first-line') {
                    // First-line users should see all tickets in their support line
                    const ticketsResponse = await axios.get(
                        `${import.meta.env.VITE_API_URL}/tickets?supportLine=first-line`, 
                        { withCredentials: true }
                    );
                    setTickets(ticketsResponse.data.tickets);
                } 
                else if (userResponse.data.user.role === 'second-line') {
                    const ticketsResponse = await axios.get(
                        `${import.meta.env.VITE_API_URL}/tickets?supportLine=second-line`, 
                        { withCredentials: true }
                    );
                    setTickets(ticketsResponse.data.tickets);
                }
                else if (['admin'].includes(userResponse.data.user.role)) {
                    // Admins can see all tickets but not process them
                    const ticketsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/tickets`, { 
                        withCredentials: true 
                    });
                    setTickets(ticketsResponse.data.tickets);
                } 
                else {
                    // Regular users see their profile
                    navigate('/profile');
                }
            } catch (err) {
                setError(err.response?.data?.msg || 'Error loading dashboard');
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

    // Sort and filter tickets based on active tab
    const getFilteredTickets = () => {
        // First filter by status if not "all" tab
        let filteredTickets = tickets;
        if (activeTab !== 'all') {
            filteredTickets = tickets.filter(ticket => ticket.status === activeTab);
        }
        
        // Then sort by priority (critical → high → medium → low)
        return filteredTickets.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    };

    // Get count of tickets by status for tab badges
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
        return <div>Loading dashboard...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Admin dashboard view
    return (
        <div className="dashboard">
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user?.username}!</p>
            
            <h2>Ticket Management</h2>
            
            {/* Status tabs */}
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
            
            {/* Tickets list */}
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
                            <p><strong>Created by:</strong> {ticket.createdBy.username}</p>
                            <p><strong>Assigned to:</strong> {ticket.assignedTo ? ticket.assignedTo.username : 'Unassigned'}</p>
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