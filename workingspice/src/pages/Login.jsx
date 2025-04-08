import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(false)
        setMsg('')
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
                email,
                password
            }, { withCredentials: true })
            
            setMsg(response.data.msg || 'Login successful!')
            setError(false)
            
        } catch (err) {
            setError(true)
            setMsg(err.response?.data?.msg || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1>Login</h1>
            
            <form onSubmit={handleSubmit}>
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
                
                <button 
                    type="submit" 
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
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