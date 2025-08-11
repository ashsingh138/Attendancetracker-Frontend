import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import apiClient from './api';
import './App.css';
// Import Pages and Components
import Header from './components/Header';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AlertModal from './components/AlertModal';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // State for the upcoming items alert modal
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [testsForAlert, setTestsForAlert] = useState([]);
    const [assignmentsForAlert, setAssignmentsForAlert] = useState([]);

    // Apply theme to the root HTML element and save preference
    useEffect(() => {
        document.documentElement.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Check for an existing user session on initial application load
    useEffect(() => {
        const checkUserSession = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Validate token with the backend and get user data
                    const { data } = await apiClient.get('/profile/me');
                    setUser(data);
                } catch (error) {
                    // If token is invalid, clear it
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        
        checkUserSession();
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem('token', token);
        window.location.reload(); // Reload to trigger the session check effect
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const handleProfileUpdate = async () => {
        try {
            const { data } = await apiClient.get('/profile/me');
            setUser(data);
        } catch (error) {
            console.error("Failed to refetch user profile", error);
        }
    };
    
    const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');

    if (loading) {
        return <div className="loader-container"><div className="loader"></div></div>;
    }

    return (
        <BrowserRouter>
            {user && (
                <Header
                    user={user}
                    toggleTheme={toggleTheme}
                    currentTheme={theme}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onLogout={handleLogout}
                />
            )}

            <Routes>
                <Route path="/" element={!user ? <Auth onLogin={handleLogin} /> : <Navigate to="/app/dashboard" />} />
                <Route 
                    path="/app/*" 
                    element={
                        user ? 
                        <Dashboard 
                            user={user} 
                            profile={user} // Pass user object as profile
                            onProfileUpdate={handleProfileUpdate} 
                            isSidebarOpen={isSidebarOpen} 
                            closeSidebar={() => setIsSidebarOpen(false)} 
                            onShowAlert={(tests, assignments) => { 
                                setTestsForAlert(tests); 
                                setAssignmentsForAlert(assignments); 
                                setShowAlertModal(true); 
                            }} 
                        /> 
                        : <Navigate to="/" />
                    } 
                />
            </Routes>
            
            <AlertModal
                isOpen={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                tests={testsForAlert}
                assignments={assignmentsForAlert}
            />
        </BrowserRouter>
    );
}

export default App;