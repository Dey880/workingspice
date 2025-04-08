import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [username, setUsername] = useState('')
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(false)
        setMsg('')
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
                email,
                password,
                repeatPassword,
                username
            }, { withCredentials: true })
            
            setMsg(response.data.msg || 'Registration successful!')
            setError(false)
            
        } catch (err) {
            setError(true)
            setMsg(err.response?.data?.msg || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1>Register</h1>
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input 
                        type="text" 
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Enter your username"
                    />
                </div>
                
                <div>
                    <label htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                    />
                </div>
                
                <div>
                    <label htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                    />
                </div>
                
                <div>
                    <label htmlFor="repeatPassword">Confirm Password</label>
                    <input 
                        type="password" 
                        id="repeatPassword"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        required
                        placeholder="Confirm your password"
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            
            {msg && (
                <div>
                    {msg}
                </div>
            )}
        </div>
    );
}