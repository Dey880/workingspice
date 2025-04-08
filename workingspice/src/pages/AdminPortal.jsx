import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminPortal() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [settings, setSettings] = useState({});
    const [statistics, setStatistics] = useState({
        userStats: { total: 0, admins: 0, users: 0, newest: [] },
        ticketStats: { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 },
        commentCount: 0
    });
    const [updatingRole, setUpdatingRole] = useState(false);
    const [roleUpdateMsg, setRoleUpdateMsg] = useState('');
    const [updatingSettings, setUpdatingSettings] = useState(false);
    const [settingsUpdateMsg, setSettingsUpdateMsg] = useState('');
    const [newCategory, setNewCategory] = useState('');
    
    const navigate = useNavigate();

    // Fetch current user and verify owner permissions
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Get current user info
                const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, { 
                    withCredentials: true 
                });
                setUser(userResponse.data.user);

                // Check if owner - if not, redirect to dashboard
                if (userResponse.data.user.role !== 'owner') {
                    navigate('/dashboard');
                    return;
                }

                // Load initial data for dashboard
                await fetchDashboardData();
                
            } catch (err) {
                setError(err.response?.data?.msg || 'Error loading admin portal');
                // Redirect to login if unauthorized
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [navigate]);

    // Function to fetch dashboard statistics
    const fetchDashboardData = async () => {
        try {
            const statsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, { 
                withCredentials: true 
            });
            setStatistics(statsResponse.data);
        } catch (err) {
            console.error('Error fetching statistics:', err);
        }
    };

    // Function to fetch all users when users tab is activated
    const fetchUsers = async () => {
        try {
            const usersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, { 
                withCredentials: true 
            });
            setUsers(usersResponse.data.users);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.msg || 'Error loading users');
        }
    };

    // Function to fetch settings when settings tab is activated
    const fetchSettings = async () => {
        try {
            const settingsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/admin/settings`, { 
                withCredentials: true 
            });
            setSettings(settingsResponse.data.settings);
        } catch (err) {
            console.error('Error fetching settings:', err);
            setError(err.response?.data?.msg || 'Error loading settings');
        }
    };

    // Handle tab change and load appropriate data
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        
        if (tab === 'users') {
            fetchUsers();
        } else if (tab === 'settings') {
            fetchSettings();
        } else if (tab === 'dashboard') {
            fetchDashboardData();
        }
    };

    // Handle role update
    const handleRoleUpdate = async (userId, newRole) => {
        setUpdatingRole(true);
        setRoleUpdateMsg('');
        
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/users/role`,
                {
                    userId,
                    newRole
                },
                { withCredentials: true }
            );
            
            setRoleUpdateMsg(response.data.msg);
            
            // Update user in list with new role
            setUsers(users.map(user => 
                user._id === userId ? { ...user, role: newRole } : user
            ));
            
            // Refresh dashboard stats
            fetchDashboardData();
            
        } catch (err) {
            setRoleUpdateMsg(err.response?.data?.msg || 'Error updating user role');
        } finally {
            setUpdatingRole(false);
        }
    };

    // Handle settings update
    const handleSettingsUpdate = async () => {
        setUpdatingSettings(true);
        setSettingsUpdateMsg('');
        
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/settings`,
                settings,
                { withCredentials: true }
            );
            
            setSettingsUpdateMsg('Settings updated successfully');
            setSettings(response.data.settings);
            
        } catch (err) {
            setSettingsUpdateMsg(err.response?.data?.msg || 'Error updating settings');
        } finally {
            setUpdatingSettings(false);
        }
    };

    // Handle settings change
    const handleSettingChange = (key, value) => {
        setSettings({
            ...settings,
            [key]: value
        });
    };

    // Add a ticket category
    const addTicketCategory = () => {
        if (!newCategory.trim()) return;
        
        // Don't add duplicate categories
        if (settings.ticketCategories && settings.ticketCategories.includes(newCategory)) {
            return;
        }
        
        setSettings({
            ...settings,
            ticketCategories: [
                ...(settings.ticketCategories || []),
                newCategory.trim()
            ]
        });
        
        setNewCategory('');
    };

    // Remove a ticket category
    const removeTicketCategory = (category) => {
        setSettings({
            ...settings,
            ticketCategories: settings.ticketCategories.filter(c => c !== category)
        });
    };

    if (loading) {
        return <div>Loading admin portal...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Calculate ticket status percentages for the chart
    const calculateStatusPercentages = () => {
        const { total, open, inProgress, resolved, closed } = statistics.ticketStats;
        if (total === 0) return { open: 0, inProgress: 0, resolved: 0, closed: 0 };
        
        return {
            open: (open / total) * 100,
            inProgress: (inProgress / total) * 100,
            resolved: (resolved / total) * 100,
            closed: (closed / total) * 100
        };
    };

    const statusPercentages = calculateStatusPercentages();

    return (
        <div className="admin-portal">
            <h1>Admin Portal</h1>
            <p>Welcome, {user?.username}! Manage your helpdesk platform here.</p>
            
            {/* Navigation tabs */}
            <div className="admin-tabs">
                <button 
                    className={activeTab === 'dashboard' ? 'active' : ''}
                    onClick={() => handleTabChange('dashboard')}
                >
                    <i className="fas fa-chart-line"></i> Dashboard
                </button>
                <button 
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => handleTabChange('users')}
                >
                    <i className="fas fa-users"></i> Users & Permissions
                </button>
                <button 
                    className={activeTab === 'settings' ? 'active' : ''}
                    onClick={() => handleTabChange('settings')}
                >
                    <i className="fas fa-cog"></i> Platform Settings
                </button>
            </div>
            
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div className="admin-content">
                    <h2>Platform Overview</h2>
                    
                    <div className="stats-grid">
                        <div className="stat-card users">
                            <h3>Total Users</h3>
                            <p>{statistics.userStats.total}</p>
                            <div className="stat-details">
                                Regular Users: {statistics.userStats.users} | 
                                Admins: {statistics.userStats.admins}
                            </div>
                        </div>
                        
                        <div className="stat-card tickets">
                            <h3>Total Tickets</h3>
                            <p>{statistics.ticketStats.total}</p>
                            <div className="stat-details">
                                Active: {statistics.ticketStats.open + statistics.ticketStats.inProgress} | 
                                Resolved: {statistics.ticketStats.resolved} |
                                Closed: {statistics.ticketStats.closed}
                            </div>
                        </div>
                        
                        <div className="stat-card comments">
                            <h3>Total Comments</h3>
                            <p>{statistics.commentCount}</p>
                            <div className="stat-details">
                                Avg per Ticket: {statistics.ticketStats.total ? 
                                    (statistics.commentCount / statistics.ticketStats.total).toFixed(1) : 0}
                            </div>
                        </div>
                    </div>
                    
                    <h3>Ticket Status Distribution</h3>
                    <div className="ticket-status-stats">
                        <div className="status-bar">
                            <div 
                                className="status-segment segment-open" 
                                style={{ width: `${statusPercentages.open}%` }}
                                title={`Open: ${statistics.ticketStats.open} tickets`}
                            ></div>
                            <div 
                                className="status-segment segment-in-progress" 
                                style={{ width: `${statusPercentages.inProgress}%` }}
                                title={`In Progress: ${statistics.ticketStats.inProgress} tickets`}
                            ></div>
                            <div 
                                className="status-segment segment-resolved" 
                                style={{ width: `${statusPercentages.resolved}%` }}
                                title={`Resolved: ${statistics.ticketStats.resolved} tickets`}
                            ></div>
                            <div 
                                className="status-segment segment-closed" 
                                style={{ width: `${statusPercentages.closed}%` }}
                                title={`Closed: ${statistics.ticketStats.closed} tickets`}
                            ></div>
                        </div>
                        <div className="status-legend">
                            <div className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: 'var(--status-open)' }}></div>
                                <span>Open ({statistics.ticketStats.open})</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: 'var(--status-in-progress)' }}></div>
                                <span>In Progress ({statistics.ticketStats.inProgress})</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: 'var(--status-resolved)' }}></div>
                                <span>Resolved ({statistics.ticketStats.resolved})</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: 'var(--status-closed)' }}></div>
                                <span>Closed ({statistics.ticketStats.closed})</span>
                            </div>
                        </div>
                    </div>
                    
                    <h3>Newest Users</h3>
                    {statistics.userStats.newest.length > 0 ? (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statistics.userStats.newest.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No users found.</p>
                    )}
                </div>
            )}
            
            {/* Users & Permissions Tab */}
            {activeTab === 'users' && (
                <div className="admin-content">
                    <h2>User Management</h2>
                    <p>Manage user roles and permissions for your platform.</p>
                    
                    {roleUpdateMsg && (
                        <div className="settings-success">{roleUpdateMsg}</div>
                    )}
                    
                    {users.length > 0 ? (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="role-actions">
                                                {user.role !== 'owner' && (
                                                    <>
                                                        {user.role === 'user' && (
                                                            <button 
                                                                className="promote"
                                                                onClick={() => handleRoleUpdate(user._id, 'admin')}
                                                                disabled={updatingRole}
                                                            >
                                                                Promote to Admin
                                                            </button>
                                                        )}
                                                        
                                                        {user.role === 'admin' && (
                                                            <button 
                                                                className="demote"
                                                                onClick={() => handleRoleUpdate(user._id, 'user')}
                                                                disabled={updatingRole}
                                                            >
                                                                Demote to User
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No users found. Please refresh to try again.</p>
                    )}
                </div>
            )}
            
            {/* Platform Settings Tab */}
            {activeTab === 'settings' && (
                <div className="admin-content">
                    <h2>Platform Settings</h2>
                    <p>Configure site-wide settings for your helpdesk platform.</p>
                    
                    {settings && (
                        <form className="settings-form" onSubmit={(e) => { e.preventDefault(); handleSettingsUpdate(); }}>
                            <div className="settings-section">
                                <h3>General Settings</h3>
                                
                                <div className="form-row">
                                    <label htmlFor="siteName">Site Name:</label>
                                    <input
                                        type="text"
                                        id="siteName"
                                        value={settings.siteName || 'WorkingSpice Helpdesk'}
                                        onChange={(e) => handleSettingChange('siteName', e.target.value)}
                                        className="form-control"
                                    />
                                </div>
                                
                                <div className="form-row">
                                    <label htmlFor="logo">Logo Icon:</label>
                                    <input
                                        type="text"
                                        id="logo"
                                        value={settings.logo || '⚡'}
                                        onChange={(e) => handleSettingChange('logo', e.target.value)}
                                        className="form-control"
                                        placeholder="⚡, 🛠️, 🔧, etc."
                                    />
                                </div>
                                
                                <div className="form-row">
                                    <label htmlFor="primaryColor">Primary Color:</label>
                                    <div>
                                        <input
                                            type="color"
                                            id="primaryColor"
                                            value={settings.primaryColor || '#2a6592'}
                                            onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                                        />
                                        <span className="color-preview" style={{ backgroundColor: settings.primaryColor }}></span>
                                        <span> {settings.primaryColor}</span>
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <label htmlFor="maintenanceMode">Maintenance Mode:</label>
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="maintenanceMode"
                                            checked={settings.maintenanceMode || false}
                                            onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                                        />
                                        <label htmlFor="maintenanceMode" style={{ marginLeft: '10px' }}>
                                            Enable maintenance mode (only admins can access the site)
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="settings-section">
                                <h3>Registration Settings</h3>
                                
                                <div className="form-row">
                                    <label htmlFor="allowPublicRegistration">Public Registration:</label>
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="allowPublicRegistration"
                                            checked={settings.allowPublicRegistration !== false}
                                            onChange={(e) => handleSettingChange('allowPublicRegistration', e.target.checked)}
                                        />
                                        <label htmlFor="allowPublicRegistration" style={{ marginLeft: '10px' }}>
                                            Allow public user registration
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="settings-section">
                                <h3>Ticket Settings</h3>
                                
                                <div className="form-row">
                                    <label htmlFor="defaultTicketPriority">Default Priority:</label>
                                    <select
                                        id="defaultTicketPriority"
                                        value={settings.defaultTicketPriority || 'medium'}
                                        onChange={(e) => handleSettingChange('defaultTicketPriority', e.target.value)}
                                        className="form-control"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                
                                <div className="form-row">
                                    <label htmlFor="ticketCategoriesEnabled">Enable Categories:</label>
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="ticketCategoriesEnabled"
                                            checked={settings.ticketCategoriesEnabled || false}
                                            onChange={(e) => handleSettingChange('ticketCategoriesEnabled', e.target.checked)}
                                        />
                                        <label htmlFor="ticketCategoriesEnabled" style={{ marginLeft: '10px' }}>
                                            Enable ticket categories
                                        </label>
                                    </div>
                                </div>
                                
                                {settings.ticketCategoriesEnabled && (
                                    <div className="form-row">
                                        <label>Ticket Categories:</label>
                                        <div>
                                            <div>
                                                {settings.ticketCategories && settings.ticketCategories.length > 0 ? (
                                                    settings.ticketCategories.map((category, index) => (
                                                        <span key={index} className="ticket-category-tag">
                                                            {category}
                                                            <button 
                                                                type="button"
                                                                onClick={() => removeTicketCategory(category)}
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p>No categories defined</p>
                                                )}
                                            </div>
                                            
                                            <div className="ticket-category-controls">
                                                <input
                                                    type="text"
                                                    value={newCategory}
                                                    onChange={(e) => setNewCategory(e.target.value)}
                                                    placeholder="New category"
                                                    className="form-control"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={addTicketCategory}
                                                    className="btn"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                type="submit"
                                className="save-settings-button"
                                disabled={updatingSettings}
                            >
                                {updatingSettings ? 'Saving...' : 'Save Settings'}
                            </button>
                            
                            {settingsUpdateMsg && (
                                <div className="settings-success">{settingsUpdateMsg}</div>
                            )}
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}