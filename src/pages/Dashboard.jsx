import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import apiClient from '../api';

// Import all dashboard components
import Sidebar from '../components/Sidebar';
import SemesterManager from '../components/dashboard/SemesterManager';
import SubjectManager from '../components/dashboard/SubjectManager';
import TestManager from '../components/dashboard/TestManager';
import AssignmentManager from '../components/dashboard/AssignmentManager';
import ScheduleDisplay from '../components/dashboard/ScheduleDisplay';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import ProfilePage from './ProfilePage';
import UpdatePassword from '../components/dashboard/UpdatePassword';
import AttendanceCalendar from '../components/dashboard/AttendanceCalendar';
import ReportGenerator from '../components/dashboard/ReportGenerator';
 // 1. IMPORT THE NEW COMPONENT
import ArchivesPage from './ArchivePages';
const dayOfWeekAsInteger = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };

function Dashboard({ user, profile, onProfileUpdate, isSidebarOpen, closeSidebar, onShowAlert }) {
    const [activeSemester, setActiveSemester] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [tests, setTests] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataVersion, setDataVersion] = useState(0);

    const location = useLocation();

    const generateSchedule = useCallback((currentSemester, currentSubjects, attendanceData) => {
        let generated = [];
        if (!currentSemester?.start_date || !currentSemester?.end_date) {
            setSchedule([]);
            return;
        }
        let currentDate = new Date(currentSemester.start_date);
        const endDate = new Date(currentSemester.end_date);

        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            currentSubjects.forEach(subject => {
                (subject.schedule || []).forEach(classSlot => {
                    if (dayOfWeekAsInteger[classSlot.day] === dayOfWeek) {
                        const dateString = currentDate.toISOString().split('T')[0];
                        const existingRecord = attendanceData.find(r => r.date === dateString && r.subject_id === subject._id);
                        generated.push({ 
                            ...existingRecord,
                            id: existingRecord?._id || `${dateString}-${subject._id}`,
                            date: dateString, 
                            subject_id: subject._id, 
                            subject_code: subject.subject_code, 
                            subject_name: subject.subject_name, 
                            duration: classSlot.duration, 
                            status: existingRecord?.status || 'not_taken', 
                            personal_status: existingRecord?.personal_status || null, 
                            reason: existingRecord?.reason || null 
                        });
                    }
                });
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        setSchedule(generated);
    }, []);

    const fetchAllData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data } = await apiClient.get('/dashboard');
            if (data.activeSemester) {
                setActiveSemester(data.activeSemester);
                setSubjects(data.subjects || []);
                setTests(data.tests || []);
                setAssignments(data.assignments || []);
                generateSchedule(data.activeSemester, data.subjects || [], data.attendanceRecords || []);
                
                if (location.pathname.endsWith('/dashboard')) {
                    const hasShownAlert = sessionStorage.getItem(`alertShown_v1_${data.activeSemester._id}`);
                    if (!hasShownAlert) {
                        onShowAlert(data.tests || [], data.assignments || []);
                        sessionStorage.setItem(`alertShown_v1_${data.activeSemester._id}`, 'true');
                    }
                }

            } else {
                setActiveSemester(null); setSubjects([]); setSchedule([]); setTests([]); setAssignments([]);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [user, generateSchedule, onShowAlert, location.pathname]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData, dataVersion]);

    const forceDataRefresh = () => setDataVersion(v => v + 1);

    const handleAttendanceUpdate = (updatedRecord) => {
        setSchedule(prevSchedule =>
            prevSchedule.map(item =>
                (item.date === updatedRecord.date && item.subject_id === updatedRecord.subject_id)
                    ? { ...item, ...updatedRecord }
                    : item
            )
        );
    };

    const handleBulkAttendanceUpdate = (updatedRecords) => {
        setSchedule(prevSchedule => {
            const updatedMap = new Map(updatedRecords.map(r => [`${r.date}-${r.subject_id}`, r]));
            return prevSchedule.map(item => {
                const key = `${item.date}-${item.subject_id}`;
                return updatedMap.has(key) ? { ...item, ...updatedMap.get(key) } : item;
            });
        });
    };

    return (
        <div className="app-container">
            {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
            <aside className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}><Sidebar onLinkClick={closeSidebar} /></aside>
            <main className="main-content">
                {loading ? <div className="loader-container"><div className="loader"></div></div> : (
                    <Routes>
                        <Route path="dashboard" element={<DashboardCharts subjects={subjects} schedule={schedule} semester={activeSemester} />} />
                        <Route path="schedule" element={<ScheduleDisplay schedule={schedule} onAttendanceUpdate={handleAttendanceUpdate} onBulkUpdate={handleBulkAttendanceUpdate} />} />
                        <Route path="calendar" element={<AttendanceCalendar schedule={schedule} />} />
                        <Route path="subjects" element={<SubjectManager subjects={subjects} schedule={schedule} onUpdate={forceDataRefresh} semesterId={activeSemester?._id} />} />
                        <Route path="academics" element={<div className="academics-container"><TestManager subjects={subjects} tests={tests} onUpdate={forceDataRefresh} /><AssignmentManager subjects={subjects} assignments={assignments} onUpdate={forceDataRefresh} /></div>} />
                        <Route path="profile" element={<ProfilePage user={user} profile={profile} onUpdate={onProfileUpdate} />} />
                        <Route path="archives" element={<ArchivesPage />} />
                        {/* 2. ADD THE NOTIFICATIONSETTINGS COMPONENT TO THE SETTINGS ROUTE */}
                        <Route path="settings" element={
                            <div>
                                <SemesterManager semester={activeSemester} onUpdate={forceDataRefresh} />
                                
                                <ReportGenerator user={user} profile={profile} semester={activeSemester} subjects={subjects} schedule={schedule} />
                                <UpdatePassword />
                            </div>
                        } />

                    </Routes>
                )}
            </main>
        </div>
    );
}

export default Dashboard;