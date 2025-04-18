import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useSettings } from '../contexts/SettingsContext';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const { settings } = useSettings();

    useEffect(() => {
        // Check if user is logged in
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, { 
                    withCredentials: true 
                });
                setUser(response.data.user);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [location.pathname]); // Re-check when path changes

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" style={{ content: 'none' }} className="custom-brand-link">
                    <span className="logo-container">{settings?.logo || '⚡'}</span> {settings?.siteName || 'WorkingSpice Helpdesk'}
                </Link>
            </div>
            <div className="navbar-links">
                {!loading && (
                    <>
                        {user ? (
                            <>
                                {(user.role === 'admin' || user.role === "first-line" || user.role === "second-line") && (
                                    <Link 
                                        to="/dashboard"
                                        className={location.pathname === '/dashboard' ? 'active' : ''}
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <Link 
                                    to="/profile"
                                    className={location.pathname === '/profile' ? 'active' : ''}
                                >
                                    Profile
                                </Link>
                                {user.role === 'admin' && (
                                    <Link 
                                        to="/admin"
                                        className={location.pathname === '/admin' ? 'active' : ''}
                                    >
                                        Admin Portal
                                    </Link>
                                )}
                                <Link 
                                    to="/logout"
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        try {
                                            await axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`, { 
                                                withCredentials: true 
                                            });
                                            setUser(null);
                                            window.location.href = '/login';
                                        } catch (err) {
                                            console.error('Logout failed:', err);
                                        }
                                    }}
                                >
                                    Logout
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/login"
                                    className={location.pathname === '/login' ? 'active' : ''}
                                >
                                    Login
                                </Link>
                                {settings.allowPublicRegistration && (
                                    <Link 
                                        to="/register"
                                        className={location.pathname === '/register' ? 'active' : ''}
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                        <Link 
                            to="/help"
                            className={location.pathname === '/help' ? 'active' : ''}
                        >
                            Help & FAQ
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}