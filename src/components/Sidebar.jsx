import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ onLinkClick }) => {
    return (
        <aside className="app-sidebar">
            <nav>
                <ul>
                    <li><NavLink to="/app/dashboard" onClick={onLinkClick}>📊 Dashboard</NavLink></li>
                    <li><NavLink to="/app/schedule" onClick={onLinkClick}>🗓️ Schedule</NavLink></li>
                    <li><NavLink to="/app/calendar" onClick={onLinkClick}>📅 Calendar</NavLink></li>
                    <li><NavLink to="/app/subjects" onClick={onLinkClick}>📚 Subjects</NavLink></li>
                    <li><NavLink to="/app/academics" onClick={onLinkClick}>📝 Academics</NavLink></li>
                    
                    {/* --- ADD THIS LINE --- */}
                    <li><NavLink to="/app/archives" onClick={onLinkClick}>🗃️ Archives</NavLink></li>
                    
                    <li><NavLink to="/app/profile" onClick={onLinkClick}>👤 Profile</NavLink></li>
                    <li><NavLink to="/app/settings" onClick={onLinkClick}>⚙️ Settings</NavLink></li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;