import React from 'react';

function AlertModal({ tests, assignments, isOpen, onClose }) {
    if (!isOpen) return null;

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const relevantTests = tests.filter(t => t.status === 'Pending');
    const relevantAssignments = assignments.filter(a => a.status === 'Pending');

    const upcomingTests = relevantTests.filter(test => {
        const testDate = new Date(test.test_datetime);
        return testDate >= now && testDate <= sevenDaysFromNow;
    });

    const pendingAssignments = relevantAssignments.filter(assignment => {
        const deadline = new Date(assignment.deadline);
        return deadline >= now && deadline <= sevenDaysFromNow;
    });

    const hasUpcomingItems = upcomingTests.length > 0 || pendingAssignments.length > 0;

    return (
        <div className="modal-overlay">
            <div className="modal-content panel">
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', textAlign: 'center' }}>🗓️ Upcoming Week</h2>
                {!hasUpcomingItems ? (
                    <p style={{ textAlign: 'center' }}>No pending tests or assignments due in the next 7 days. Great job!</p>
                ) : (
                    <>
                        {upcomingTests.length > 0 && (
                            <div className="mb-4">
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upcoming Tests</h3>
                                <ul className="alert-list">
                                    {upcomingTests.map(test => (
                                        <li key={`test-${test._id}`}>
                                            <strong>{test.test_name}</strong> ({test.subjects?.subject_code})
                                            <span className="alert-date">
                                                {new Date(test.test_datetime).toLocaleString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {pendingAssignments.length > 0 && (
                             <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Pending Assignments</h3>
                                 <ul className="alert-list">
                                    {pendingAssignments.map(assignment => (
                                         <li key={`assignment-${assignment._id}`}>
                                            <strong>{assignment.assignment_name}</strong> ({assignment.subjects?.subject_code})
                                             <span className="alert-date">
                                                 Due: {new Date(assignment.deadline).toLocaleString()}
                                             </span>
                                         </li>
                                    ))}
                                 </ul>
                             </div>
                        )}
                    </>
                )}
                <button onClick={onClose} className="btn btn-primary w-full" style={{ marginTop: '1.5rem' }}>
                    Got it!
                </button>
            </div>
        </div>
    );
}

export default AlertModal;