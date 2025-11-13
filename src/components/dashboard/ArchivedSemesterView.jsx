// src/components/dashboard/ArchivedSemesterView.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../api'; // Corrected path
import SubjectManager from './SubjectManager'; // Import SubjectManager
import TestManager from './TestManager'; // Import TestManager
import AssignmentManager from './AssignmentManager'; // Import AssignmentManager

function ArchivedSemesterView({ semester }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [semesterData, setSemesterData] = useState({
        subjects: [],
        schedule: [],
        tests: [],
        assignments: [] 
    });

    useEffect(() => {
        const fetchDataForSemester = async () => {
            if (!semester?._id) return;
            setLoading(true);
            try {
                // This single API call gets all the data we need
                const response = await apiClient.get(`/dashboard/semester/${semester._id}`);
                
                setSemesterData({
                    subjects: response.data.subjects,
                    schedule: response.data.attendanceRecords, // Use attendanceRecords for schedule
                    tests: response.data.tests,
                    assignments: response.data.assignments 
                });
            } catch (err) {
                setError('Failed to load semester details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDataForSemester();
    }, [semester]);

    if (loading) return <p>Loading semester details...</p>;
    if (error) return <p>{error}</p>;

    const { subjects, schedule, tests, assignments } = semesterData;

    return (
        <div className="archived-view">
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Archive: {semester.name} - {semester.year}
            </h2>
            
            {/* Render SubjectManager in read-only mode */}
            {/* This will show the list of subjects, stats, and logs you wanted */}
            <SubjectManager 
                subjects={subjects} 
                schedule={schedule} 
                onUpdate={() => {}} // Pass empty function
                semesterId={semester._id}
                isReadOnly={true} 
            />
            
            <div className="academics-container" style={{marginTop: '2rem'}}>
                {/* Render TestManager in read-only mode */}
                <TestManager 
                    subjects={subjects} 
                    tests={tests} 
                    onUpdate={() => {}} // Pass empty function
                    isReadOnly={true}
                />
                
                {/* Render AssignmentManager in read-only mode */}
                <AssignmentManager
                    subjects={subjects}
                    assignments={assignments}
                    onUpdate={() => {}} // Pass empty function
                    isReadOnly={true}
                />
            </div>
        </div>
    );
}

export default ArchivedSemesterView;