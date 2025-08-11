import React from 'react';
import { FaBars, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const Header = ({ user, toggleTheme, currentTheme, onToggleSidebar, onLogout }) => (
    <header className="app-header">
        <button className="hamburger-btn" onClick={onToggleSidebar}>
            <FaBars />
        </button>
        
        <h1>Attendance Pro</h1>
        <div className="header-actions">
            <button onClick={toggleTheme} className="theme-toggle">
                {currentTheme === 'light' ? '🌙' : '☀️'}
            </button>
            {user && (
                <div className="user-menu">
                    <div className="profile-display">
                        <img 
                            src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name || user.email}`} 
                            alt="Avatar" 
                            className="header-avatar"
                        />
                        <span>{user.full_name || user.email}</span>
                        <div className="dropdown-menu">
                             <NavLink to="/app/profile"><FaUserCircle /> My Profile</NavLink>
                             <button onClick={onLogout} className="btn-signout-dropdown"><FaSignOutAlt /> Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </header>
);

export default Header;