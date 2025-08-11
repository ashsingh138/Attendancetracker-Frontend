import React, { useState } from 'react';
import apiClient from '../../api';

function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.put('/auth/update-password', { password });
            setMessage(response.data.message);
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="panel" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Update Password</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>New Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" required autoComplete="new-password"/>
                </div>
                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-input" required autoComplete="new-password"/>
                </div>
                {error && <p className="error" style={{marginBottom: '1rem'}}>{error}</p>}
                {message && <p className="message" style={{marginBottom: '1rem'}}>{message}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
            </form>
        </div>
    );
}

export default UpdatePassword;