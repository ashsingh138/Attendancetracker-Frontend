// Create this new file: e.g., src/components/ArchivesPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import ArchivedSemesterView from '../components/dashboard/ArchivedSemesterView'; // We will create this next

function ArchivesPage() {
    const [archivedSemesters, setArchivedSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 1. Fetch all archived semesters on load
    useEffect(() => {
        const fetchArchived = async () => {
            setLoading(true);
            try {
                // You'll need a backend endpoint that returns semesters
                // where is_archived = true
                const response = await apiClient.get('/semesters/archived'); 
                setArchivedSemesters(response.data);
            } catch (err) {
                setError('Failed to load archives.');
            } finally {
                setLoading(false);
            }
        };
        fetchArchived();
    }, []);

    if (loading && !selectedSemester) return <p>Loading archives...</p>;
    if (error) return <p>{error}</p>;

    // 2. If a semester is selected, show its details
    if (selectedSemester) {
        return (
            <div className="panel">
                <button 
                    onClick={() => setSelectedSemester(null)} 
                    className="action-btn"
                    style={{ marginBottom: '1.5rem' }}
                >
                    &larr; Back to Archives List
                </button>
                {/* This component will fetch and render all the details */}
                <ArchivedSemesterView semester={selectedSemester} />
            </div>
        );
    }

    // 3. If no semester is selected, show the list
    return (
        <div className="panel">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Archived Semesters</h3>
            {archivedSemesters.length === 0 ? (
                <p>No archived semesters found.</p>
            ) : (
                <div className="subject-list-container">
                    {archivedSemesters.map(sem => (
                        <div key={sem._id} className="subject-card">
                            <div className="subject-card-header">
                                <div>
                                    <h4>{sem.name} ({sem.year})</h4>
                                    <p className="professor-name">
                                        {new Date(sem.start_date).toLocaleDateString()} - {new Date(sem.end_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="subject-card-actions">
                                    <button 
                                        onClick={() => setSelectedSemester(sem)} 
                                        className="btn btn-primary"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ArchivesPage;