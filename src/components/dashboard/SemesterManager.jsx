import React, { useState, useEffect } from 'react';
import apiClient from '../../api';

function SemesterManager({ semester, onUpdate }) {
    const [name, setName] = useState('');
    const [year, setYear] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (semester) {
            setName(semester.name || '');
            setYear(semester.year || '');
            setStartDate(semester.start_date || '');
            setEndDate(semester.end_date || '');
        } else {
            setName(''); setYear(''); setStartDate(''); setEndDate('');
        }
    }, [semester]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = { 
            id: semester?._id,
            name, year, start_date: startDate, end_date: endDate 
        };
        try {
            await apiClient.post('/semesters', payload);
            alert(semester ? "Semester details updated!" : "New active semester has been set!");
            onUpdate();
        } catch (error) {
            alert(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        if (!semester) return;
        if (window.confirm("Are you sure? This will hide the semester and its data from the dashboard. This action cannot be undone.")) {
            setLoading(true);
            try {
                await apiClient.put(`/semesters/${semester._id}/archive`);
                alert("Semester archived successfully!");
                onUpdate();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to archive');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="panel">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Active Semester</h3>
            <form onSubmit={handleSubmit}>
                 <div className="form-group"><label>Semester Name</label><input type="text" placeholder="e.g., Autumn 2025" value={name} onChange={e => setName(e.target.value)} className="form-input" required /></div>
                 <div className="form-group"><label>Year / Class</label><input type="text" placeholder="e.g., 3rd Year, B.Tech" value={year} onChange={e => setYear(e.target.value)} className="form-input" required /></div>
                <div className="form-group"><label>Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input" required /></div>
                <div className="form-group"><label>End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input" required /></div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem'}}>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Saving...' : (semester ? 'Update Semester' : 'Set Active Semester')}</button>
                    {semester && <button type="button" onClick={handleArchive} className="btn action-btn w-full" disabled={loading}>End & Archive Current Semester</button>}
                </div>
            </form>
        </div>
    );
}

export default SemesterManager;