import React, { useState } from 'react';
import apiClient from '../api';

function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        
        const url = isLogin ? '/auth/login' : '/auth/signup';
        try {
            const response = await apiClient.post(url, { email, password });
            if (isLogin) {
                onLogin(response.data.token);
            } else {
                setMessage(response.data.message || 'Sign up successful! Please switch to login.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="panel auth-panel">
                <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
                <p>Welcome to Attendance Pro</p>
                {message && <p className="message">{message}</p>}
                {error && <p className="error">{error}</p>}
                
                <form onSubmit={handleAuth}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary w-full">{loading ? '...' : (isLogin ? 'Login' : 'Sign Up')}</button>
                </form>

                <p className="auth-switch">
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}>
                        {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Auth;