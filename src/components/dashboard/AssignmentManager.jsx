// src/components/dashboard/AssignmentManager.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../api';

// --- Inner Component: AssignmentForm ---
function AssignmentForm({ subjects, assignment, onAssignmentModified, onCancel }) {
    const [subjectId, setSubjectId] = useState('');
    const [assignmentName, setAssignmentName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('');
    const isEditMode = !!assignment;

    useEffect(() => {
        if (isEditMode) {
            setSubjectId(assignment.subject_id);
            setAssignmentName(assignment.assignment_name);
            const localDate = new Date(assignment.due_datetime);
            setDueDate(localDate.toISOString().split('T')[0]);
            setDueTime(localDate.toTimeString().slice(0, 5));
        } else if (subjects.length > 0) {
            setSubjectId(subjects[0]._id);
        }
    }, [assignment, subjects, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const localDateTime = new Date(`${dueDate}T${dueTime}`);
        const due_datetime = localDateTime.toISOString();

        const payload = { subject_id: subjectId, assignment_name: assignmentName, due_datetime };
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
                <input type="text" placeholder="Assignment Name (e.g., HW 1)" value={assignmentName} onChange={e => setAssignmentName(e.target.value)} className="form-input" required />
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="form-input" required />
                <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="form-input" required />
            </div>
            <div style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary">{isEditMode ? 'Update Assignment' : 'Add Assignment'}</button>
                {isEditMode && <button type="button" onClick={onCancel} className="action-btn" style={{ marginLeft: '1rem' }}>Cancel</button>}
            </div>
        </form>
    );
}

// --- Main AssignmentManager Component (UPDATED with isReadOnly) ---
function AssignmentManager({ subjects, assignments, onUpdate, isReadOnly = false }) {
    const [isEditing, setIsEditing] = useState(null);

    const handleStatusChange = async (assignmentId, newStatus) => {
        if (isReadOnly) return; // Don't allow if read-only
        try {
            await apiClient.put(`/assignments/${assignmentId}`, { status: newStatus });
            onUpdate();
        } catch (error) { alert("Failed to update status."); }
    };

    const deleteAssignment = async (assignmentId) => {
        if (isReadOnly) return; // Don't allow if read-only
        if (window.confirm("Are you sure?")) {
            try {
                await apiClient.delete(`/assignments/${assignmentId}`);
                onUpdate();
            } catch (error) { alert("Failed to delete assignment."); }
        }
    };

    const handleSetEditing = (assignment) => {
        if (isReadOnly) return; // Don't allow if read-only
        setIsEditing(assignment);
    };

    return (
        <div className="panel" style={{ marginTop: isReadOnly ? '0' : '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Assignment Schedule</h3>
            
            {/* Check isReadOnly before showing the form */}
            {!isReadOnly && (
                <AssignmentForm
                    subjects={subjects} assignment={isEditing}
                    onAssignmentModified={() => { onUpdate(); setIsEditing(null); }}
                    onCancel={() => setIsEditing(null)}
                />
            )}

            <h4 style={{ 
                fontSize: '1.2rem', 
                marginTop: isReadOnly ? '0' : '2rem', // Adjust margin
                marginBottom: '1rem', 
                borderTop: isReadOnly ? 'none' : '1px solid var(--border-color)', // Adjust border
                paddingTop: isReadOnly ? '0' : '1rem' 
            }}>
                All Assignments
            </h4>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {assignments.length > 0 ? assignments.sort((a, b) => new Date(a.due_datetime) - new Date(b.due_datetime)).map(item => (
                    <div key={item._id} className="subject-card">
                        <div className="subject-card-header">
                            <div>
                                <h5>
                                    {item.status === 'Submitted' && '✅ '}
                                    {item.status === 'Cancelled' && '❌ '}
                                    {item.assignment_name} ({item.subjects?.subject_code || 'N/A'})
                                </h5>
                                <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                                    Due: {new Date(item.due_datetime).toLocaleString()}
                                </p>
                            </div>
                            <div className="subject-card-actions">
                                {/* Check isReadOnly before showing action buttons */}
                                {!isReadOnly ? (
                                    <>
                                        <select value={item.status} onChange={(e) => handleStatusChange(item._id, e.target.value)} className="form-select action-dropdown">
                                            <option value="Pending">Pending</option>
                                            <option value="Submitted">Submitted</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                        <button onClick={() => handleSetEditing(item)} className="btn-edit">Edit</button>
                                        <button onClick={() => deleteAssignment(item._id)} className="btn-danger-small">Delete</button>
                                    </>
                                ) : (
                                    // Show read-only status
                                    <p style={{ fontWeight: 'bold', margin: 0 }}>Status: {item.status}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )) : <p>No assignments scheduled.</p>}
            </div>
        </div>
    );
}

export default AssignmentManager;