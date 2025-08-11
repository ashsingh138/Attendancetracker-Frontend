import React, { useState, useEffect } from 'react';
import apiClient from '../../api';

function NotificationSettings({ user }) {
    const [prefs, setPrefs] = useState({
        classes: true,
        tests: true,
        assignments: true,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.notification_preferences) {
            setPrefs(user.notification_preferences);
        }
    }, [user]);

    const handleToggle = (key) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await apiClient.put('/notifications/preferences', prefs);
            alert('Settings saved!');
        } catch (error) {
            alert('Failed to save settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="panel" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Notification Settings</h3>
            <div className="form-group">
                <label className="toggle-switch">
                    Classes
                    <input type="checkbox" checked={prefs.classes} onChange={() => handleToggle('classes')} />
                    <span className="slider"></span>
                </label>
                <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Notify 10 minutes before each class.</p>
            </div>
            <div className="form-group">
                <label className="toggle-switch">
                    Tests
                    <input type="checkbox" checked={prefs.tests} onChange={() => handleToggle('tests')} />
                    <span className="slider"></span>
                </label>
                <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Notify 1 day, 6 hours, 1 hour, and 30 minutes before tests.</p>
            </div>
             <div className="form-group">
                <label className="toggle-switch">
                    Assignments
                    <input type="checkbox" checked={prefs.assignments} onChange={() => handleToggle('assignments')} />
                    <span className="slider"></span>
                </label>
                <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Notify 1 day, 3 hours, and 1 hour before deadlines.</p>
            </div>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Preferences'}
            </button>
        </div>
    );
}

export default NotificationSettings;