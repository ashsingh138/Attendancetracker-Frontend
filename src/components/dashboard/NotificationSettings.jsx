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
            
            <div className="notification-settings-item">
                <div className="notification-text">
                    <h5>Classes</h5>
                    <p>Notify 10 minutes before each class.</p>
                </div>
                <label className="toggle-switch">
                    <input type="checkbox" checked={prefs.classes} onChange={() => handleToggle('classes')} />
                    <span className="slider"></span>
                </label>
            </div>

            <div className="notification-settings-item">
                <div className="notification-text">
                    <h5>Tests</h5>
                    <p>Notify 1 day, 6 hours, 1 hour, and 30 minutes before tests.</p>
                </div>
                <label className="toggle-switch">
                    <input type="checkbox" checked={prefs.tests} onChange={() => handleToggle('tests')} />
                    <span className="slider"></span>
                </label>
            </div>

            <div className="notification-settings-item">
                <div className="notification-text">
                    <h5>Assignments</h5>
                    <p>Notify 1 day, 3 hours, and 1 hour before deadlines.</p>
                </div>
                <label className="toggle-switch">
                    <input type="checkbox" checked={prefs.assignments} onChange={() => handleToggle('assignments')} />
                    <span className="slider"></span>
                </label>
            </div>

            <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{marginTop: '1.5rem'}}>
                {loading ? 'Saving...' : 'Save Preferences'}
            </button>
        </div>
    );
}

export default NotificationSettings;