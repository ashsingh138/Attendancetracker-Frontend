// Create this new file: e.g., src/components/ArchivedSemesterView.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../api';
import DashboardCharts from './DashboardCharts'; // Reuse existing component
import AttendanceCalendar from './AttendanceCalendar'; // Reuse existing component
import TestManager from './TestManager'; // Reuse existing component

function ArchivedSemesterView({ semester }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [semesterData, setSemesterData] = useState({
        subjects: [],
        schedule: [],
        tests: []
    });

    useEffect(() => {
        const fetchDataForSemester = async () => {
            if (!semester?._id) return;
            setLoading(true);
            try {
                // Fetch all data associated with this specific semester ID
                const [subjectsRes, scheduleRes, testsRes] = await Promise.all([
                    apiClient.get(`/subjects?semester_id=${semester._id}`),
                    apiClient.get(`/schedule?semester_id=${semester._id}`),
                    apiClient.get(`/tests?semester_id=${semester._id}`)
                ]);
                
                setSemesterData({
                    subjects: subjectsRes.data,
                    schedule: scheduleRes.data,
                    tests: testsRes.data
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

    const { subjects, schedule, tests } = semesterData;

    return (
        <div className="archived-view">
            {/* 1. Re-use DashboardCharts for stats */}
            <DashboardCharts 
                subjects={subjects} 
                schedule={schedule} 
                semester={semester} 
            />
            
            {/* 2. Re-use AttendanceCalendar */}
            <h3 style={{ fontSize: '1.5rem', marginTop: '2rem' }}>Attendance Calendar</h3>
            <AttendanceCalendar schedule={schedule} />

            {/* 3. Re-use TestManager in a read-only-ish way */}
            {/* We pass an empty function to onUpdate to disable changes */}
            <TestManager 
                subjects={subjects} 
                tests={tests} 
                onUpdate={() => {}} 
            />
            {/* Note: You might want to modify TestManager to accept a 
                'readOnly' prop to hide the forms and action buttons */}
        </div>
    );
}

export default ArchivedSemesterView;