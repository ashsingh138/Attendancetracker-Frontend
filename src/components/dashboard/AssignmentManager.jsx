import React, { useState, useEffect } from 'react';
import apiClient from '../../api';

function AssignmentForm({ subjects, assignment, onAssignmentModified, onCancel }) {
    const [subjectId, setSubjectId] = useState('');
    const [assignmentName, setAssignmentName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const isEditMode = !!assignment;

    useEffect(() => {
        if (isEditMode) {
            setSubjectId(assignment.subject_id);
            setAssignmentName(assignment.assignment_name);
            // When editing, convert the UTC date from the DB back to local for display
            const localDate = new Date(assignment.deadline);
            setDate(localDate.toISOString().split('T')[0]);
            setTime(localDate.toTimeString().slice(0,5));
        } else if (subjects.length > 0) {
            setSubjectId(subjects[0]._id);
        }
    }, [assignment, subjects, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Create a date object from the local date and time inputs from the form
        const localDateTime = new Date(`${date}T${time}`);
        
        // Convert the local date to a UTC ISO string before sending to the backend
        const deadline = localDateTime.toISOString();

        const payload = { subject_id: subjectId, assignment_name: assignmentName, deadline };
        try {
            if (isEditMode) {
                await apiClient.put(`/assignments/${assignment._id}`, payload);
            } else {
                await apiClient.post('/assignments', { ...payload, status: 'Pending' });
            }
            if (onAssignmentModified) onAssignmentModified();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save assignment.");
        }
    };

    if (subjects.length === 0) return <p>Please add a subject first to schedule an assignment.</p>;

    return (
        <form onSubmit={handleSubmit}>
            {isEditMode && <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Editing Assignment...</h4>}
            <div className="form-grid">
                <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="form-select" required>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.subject_code} - {s.subject_name}</option>)}
                </select>
                <input type="text" placeholder="Assignment Name" value={assignmentName} onChange={e => setAssignmentName(e.target.value)} className="form-input" required />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" required />
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="form-input" required />
            </div>
            <div style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary">{isEditMode ? 'Update Assignment' : 'Add Assignment'}</button>
                {isEditMode && <button type="button" onClick={onCancel} className="action-btn" style={{ marginLeft: '1rem' }}>Cancel</button>}
            </div>
        </form>
    );
}

function AssignmentManager({ subjects, assignments, onUpdate }) {
    const [isEditing, setIsEditing] = useState(null);

    const handleStatusChange = async (assignmentId, newStatus) => {
        try {
            await apiClient.put(`/assignments/${assignmentId}`, { status: newStatus });
            onUpdate();
        } catch (error) { alert("Failed to update status."); }
    };

    const deleteAssignment = async (assignmentId) => {
        if (window.confirm("Are you sure?")) {
            try {
                await apiClient.delete(`/assignments/${assignmentId}`);
                onUpdate();
            } catch (error) { alert("Failed to delete assignment."); }
        }
    };
    
    return (
        <div className="panel" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Assignment Deadlines</h3>
            <AssignmentForm
                subjects={subjects} assignment={isEditing}
                onAssignmentModified={() => { onUpdate(); setIsEditing(null); }}
                onCancel={() => setIsEditing(null)}
            />
            <h4 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>All Assignments</h4>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {assignments.length > 0 ? assignments.sort((a,b) => new Date(a.deadline) - new Date(b.deadline)).map(item => (
                        <div key={item._id} className="subject-card">
                           <div className="subject-card-header">
                                <div>
                                    <h5>
                                        {item.status === 'Completed' && '✅ '}
                                        {item.status === 'Cancelled' && '❌ '}
                                        {item.assignment_name} ({item.subjects?.subject_code || 'N/A'})
                                    </h5>
                                    <p style={{color: '#9ca3af', fontSize: '0.9rem'}}>
                                     Due: {new Date(item.deadline).toLocaleString()}
                                    </p>
                                </div>
                                <div className="subject-card-actions">
                                    <select value={item.status} onChange={(e) => handleStatusChange(item._id, e.target.value)} className="form-select action-dropdown">
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <button onClick={() => setIsEditing(item)} className="btn-edit">Edit</button>
                                    <button onClick={() => deleteAssignment(item._id)} className="btn-danger-small">Delete</button>
                                </div>
                           </div>
                        </div>
                    )) : <p>No pending assignments.</p>}
            </div>
        </div>
    );
}

export default AssignmentManager;
