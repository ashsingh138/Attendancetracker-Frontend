import React, { useState, useEffect } from 'react';
import apiClient from '../api';

function ProfilePage({ user, profile, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '', college_name: '', department: '',
        phone: '', dob: '', place: '', year_of_study: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                college_name: profile.college_name || '',
                department: profile.department || '',
                phone: profile.phone || '',
                dob: profile.dob ? profile.dob.split('T')[0] : '',
                place: profile.place || '',
                year_of_study: profile.year_of_study || '',
            });
            setAvatarPreview(profile.avatar_url);
        }
    }, [profile]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
            setAvatarPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (avatarFile) {
                const avatarFormData = new FormData();
                avatarFormData.append('avatar', avatarFile);
                await apiClient.post('/profile/avatar', avatarFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            await apiClient.put('/profile', formData);
            await onUpdate(); // Refetch user data in App component
            alert("Profile saved successfully!");
        } catch (error) {
            alert("Error updating profile: " + error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="panel profile-page-container">
            <h2>Your Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="profile-header">
                    <div className="avatar-upload">
                        <img src={avatarPreview || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.full_name || user.email}`} alt="Avatar" className="avatar-preview" />
                         <input type="file" id="avatar" onChange={handleAvatarChange} accept="image/*" style={{display: 'none'}} />
                         <label htmlFor="avatar" className="btn-edit">Change Photo</label>
                    </div>
                    <div className="form-group" style={{flexGrow: 1}}>
                        <label htmlFor="full_name">Full Name</label>
                        <input id="full_name" type="text" value={formData.full_name} onChange={handleInputChange} className="form-input" />
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-group"><label htmlFor="college_name">College Name</label><input id="college_name" type="text" value={formData.college_name} onChange={handleInputChange} className="form-input" /></div>
                    <div className="form-group"><label htmlFor="department">Department</label><input id="department" type="text" value={formData.department} onChange={handleInputChange} className="form-input" /></div>
                    <div className="form-group"><label htmlFor="phone">Phone</label><input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="form-input" /></div>
                    <div className="form-group"><label htmlFor="dob">Date of Birth</label><input id="dob" type="date" value={formData.dob} onChange={handleInputChange} className="form-input" /></div>
                    <div className="form-group"><label htmlFor="place">Place</label><input id="place" type="text" value={formData.place} onChange={handleInputChange} className="form-input" /></div>
                    <div className="form-group"><label htmlFor="year_of_study">Year of Study</label><input id="year_of_study" type="text" placeholder="e.g., 3rd Year" value={formData.year_of_study} onChange={handleInputChange} className="form-input" /></div>
                </div>
                <div className="form-actions" style={{marginTop: '1.5rem'}}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
                </div>
            </form>
        </div>
    );
}

export default ProfilePage;