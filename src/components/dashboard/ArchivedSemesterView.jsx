// src/components/dashboard/ArchivedSemesterView.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../api'; // Corrected path
import DashboardCharts from './DashboardCharts'; // Reuse existing component
import AttendanceCalendar from './AttendanceCalendar'; // Reuse existing component
import TestManager from './TestManager'; // Reuse existing component

function ArchivedSemesterView({ semester }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [semesterData, setSemesterData] = useState({
        subjects: [],
        schedule: [],
        tests: [],
        assignments: [] // Added assignments
    });

    useEffect(() => {
        const fetchDataForSemester = async () => {
            if (!semester?._id) return;
            setLoading(true);
            try {
                // --- UPDATED THIS SECTION ---
                // Makes one call to the new consolidated endpoint
                const response = await apiClient.get(`/dashboard/semester/${semester._id}`);
                
                setSemesterData({
                    subjects: response.data.subjects,
                    schedule: response.data.attendanceRecords, // Use attendanceRecords for schedule
                    tests: response.data.tests,
                    assignments: response.data.assignments // Store assignments
                });
                // --- END OF UPDATE ---

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
            {/* You could also pass a readOnly prop if you implemented it */}
            <TestManager 
                subjects={subjects} 
                tests={tests} 
                onUpdate={() => { alert('This semester is archived and read-only.'); }}
            />
            
            {/* You can also display assignments if you want */}
            {/* <AssignmentManager 
                subjects={subjects} 
                assignments={assignments} 
                onUpdate={() => { alert('This semester is archived and read-only.'); }}
            />
            */}
        </div>
    );
}

export default ArchivedSemesterView;