import React, { useState, useEffect } from 'react';
import apiClient from '../../api';

function TestForm({ subjects, test, onTestModified, onCancel }) {
    const [subjectId, setSubjectId] = useState('');
    const [testName, setTestName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const isEditMode = !!test;

    useEffect(() => {
        if (isEditMode) {
            setSubjectId(test.subject_id);
            setTestName(test.test_name);
            // When editing, convert the UTC date from the DB back to local for display
            const localDate = new Date(test.test_datetime);
            setDate(localDate.toISOString().split('T')[0]);
            setTime(localDate.toTimeString().slice(0,5));
        } else if (subjects.length > 0) {
            setSubjectId(subjects[0]._id);
        }
    }, [test, subjects, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Create a date object from the local date and time inputs from the form
        const localDateTime = new Date(`${date}T${time}`);
        
        // Convert the local date to a UTC ISO string before sending to the backend
        const test_datetime = localDateTime.toISOString(); 

        const payload = { subject_id: subjectId, test_name: testName, test_datetime };
        try {
            if (isEditMode) {
                await apiClient.put(`/tests/${test._id}`, payload);
            } else {
                await apiClient.post('/tests', { ...payload, status: 'Pending' });
            }
            if (onTestModified) onTestModified();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save test.");
        }
    };

    if (subjects.length === 0) return <p>Please add a subject first to schedule a test.</p>;

    return (
        <form onSubmit={handleSubmit}>
            {isEditMode && <h4 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Editing Test...</h4>}
            <div className="form-grid">
                <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="form-select" required>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.subject_code} - {s.subject_name}</option>)}
                </select>
                <input type="text" placeholder="Test Name (e.g., Mid-Term)" value={testName} onChange={e => setTestName(e.target.value)} className="form-input" required />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" required />
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="form-input" required />
            </div>
            <div style={{marginTop: '1rem'}}>
                <button type="submit" className="btn btn-primary">{isEditMode ? 'Update Test' : 'Add Test'}</button>
                {isEditMode && <button type="button" onClick={onCancel} className="action-btn" style={{ marginLeft: '1rem' }}>Cancel</button>}
            </div>
        </form>
    );
}

function TestManager({ subjects, tests, onUpdate }) {
    const [isEditing, setIsEditing] = useState(null);

    const handleStatusChange = async (testId, newStatus) => {
        try {
            await apiClient.put(`/tests/${testId}`, { status: newStatus });
            onUpdate();
        } catch (error) { alert("Failed to update status."); }
    };

    const deleteTest = async (testId) => {
        if (window.confirm("Are you sure?")) {
            try {
                await apiClient.delete(`/tests/${testId}`);
                onUpdate();
            } catch (error) { alert("Failed to delete test."); }
        }
    };
    
    return (
        <div className="panel" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Test Schedule</h3>
            <TestForm 
                subjects={subjects} test={isEditing}
                onTestModified={() => { onUpdate(); setIsEditing(null); }}
                onCancel={() => setIsEditing(null)}
            />
            <h4 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>All Tests</h4>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {tests.length > 0 ? tests.sort((a,b) => new Date(a.test_datetime) - new Date(b.test_datetime)).map(item => (
                        <div key={item._id} className="subject-card">
                           <div className="subject-card-header">
                                <div>
                                    <h5>
                                        {item.status === 'Completed' && '✅ '}
                                        {item.status === 'Cancelled' && '❌ '}
                                        {item.test_name} ({item.subjects?.subject_code || 'N/A'})
                                    </h5>
                                    <p style={{color: '#9ca3af', fontSize: '0.9rem'}}>
                                     {new Date(item.test_datetime).toLocaleString()}
                                    </p>
                                </div>
                                <div className="subject-card-actions">
                                    <select value={item.status} onChange={(e) => handleStatusChange(item._id, e.target.value)} className="form-select action-dropdown">
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <button onClick={() => setIsEditing(item)} className="btn-edit">Edit</button>
                                    <button onClick={() => deleteTest(item._id)} className="btn-danger-small">Delete</button>
                                </div>
                           </div>
                        </div>
                    )) : <p>No tests scheduled.</p>}
            </div>
        </div>
    );
}

export default TestManager;
