import React, { useState, useEffect } from 'react';
import apiClient from '../../api';

function NotificationSettings({ user }) {
    // Default state now has the nested structure
    const [prefs, setPrefs] = useState({
        classes: { push: true, email: true },
        tests: { push: true, email: true },
        assignments: { push: true, email: true },
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // This safely merges the user's saved preferences with the default structure.
        // This prevents errors if a user has an older data structure in the database.
        if (user && user.notification_preferences) {
            setPrefs(prev => ({
                classes: { ...prev.classes, ...user.notification_preferences.classes },
                tests: { ...prev.tests, ...user.notification_preferences.tests },
                assignments: { ...prev.assignments, ...user.notification_preferences.assignments },
            }));
        }
    }, [user]);

    // This function now handles updating the nested state
    const handleToggle = (category, type) => {
        setPrefs(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [type]: !prev[category][type],
            },
        }));
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
            
            {/* --- CLASSES --- */}
            <div className="notification-category">
                <h5>Classes</h5>
                <p>Reminders 10 minutes before each class.</p>
                <div className="toggle-group">
                    <label className="toggle-switch-small">
                        Email
                        <input type="checkbox" checked={prefs.classes.email} onChange={() => handleToggle('classes', 'email')} />
                        <span className="slider"></span>
                    </label>
                    <label className="toggle-switch-small">
                        Push
                        <input type="checkbox" checked={prefs.classes.push} onChange={() => handleToggle('classes', 'push')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            {/* --- TESTS --- */}
            <div className="notification-category">
                <h5>Tests</h5>
                <p>Reminders at 1 day, 6 hours, 1 hour, and 30 minutes before.</p>
                <div className="toggle-group">
                    <label className="toggle-switch-small">
                        Email
                        <input type="checkbox" checked={prefs.tests.email} onChange={() => handleToggle('tests', 'email')} />
                        <span className="slider"></span>
                    </label>
                    <label className="toggle-switch-small">
                        Push
                        <input type="checkbox" checked={prefs.tests.push} onChange={() => handleToggle('tests', 'push')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            {/* --- ASSIGNMENTS --- */}
            <div className="notification-category">
                <h5>Assignments</h5>
                <p>Reminders at 1 day, 3 hours, and 1 hour before deadlines.</p>
                <div className="toggle-group">
                    <label className="toggle-switch-small">
                        Email
                        <input type="checkbox" checked={prefs.assignments.email} onChange={() => handleToggle('assignments', 'email')} />
                        <span className="slider"></span>
                    </label>
                    <label className="toggle-switch-small">
                        Push
                        <input type="checkbox" checked={prefs.assignments.push} onChange={() => handleToggle('assignments', 'push')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{marginTop: '1.5rem'}}>
                {loading ? 'Saving...' : 'Save Preferences'}
            </button>
        </div>
    );
}

export default NotificationSettings;
