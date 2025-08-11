import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api';

function ScheduleDisplay({ schedule, onAttendanceUpdate, onBulkUpdate }) {
    const [collapsedSections, setCollapsedSections] = useState({});

    const getWeekOfMonth = (date) => {
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const offsetDate = date.getDate() + firstDayOfWeek - 1;
        return Math.floor(offsetDate / 7) + 1;
    };

    const groupSchedule = useCallback((scheduleItems) => {
        return scheduleItems.reduce((acc, item) => {
            const date = new Date(item.date + 'T00:00:00');
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            const week = `Week ${getWeekOfMonth(date)}`;
            if (!acc[monthYear]) acc[monthYear] = {};
            if (!acc[monthYear][week]) acc[monthYear][week] = [];
            acc[monthYear][week].push(item);
            return acc;
        }, {});
    }, []);

    // --- THIS IS THE CORRECTED CODE BLOCK ---
    // This effect now preserves the user's toggle choices.
    useEffect(() => {
        if (schedule.length > 0) {
            const grouped = groupSchedule(schedule);
            const now = new Date();
            const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });
            const currentWeek = `Week ${getWeekOfMonth(now)}`;

            // Use the functional form of setState to access the previous state
            setCollapsedSections(prevCollapsedState => {
                const newCollapsedState = { ...prevCollapsedState };
                
                Object.keys(grouped).forEach(month => {
                    // Only set the initial state if this month hasn't been seen before
                    if (newCollapsedState[month] === undefined) {
                        newCollapsedState[month] = month !== currentMonth;
                    }
                    Object.keys(grouped[month]).forEach(week => {
                        const weekKey = `${month}-${week}`;
                        // Only set the initial state if this week hasn't been seen before
                        if (newCollapsedState[weekKey] === undefined) {
                            newCollapsedState[weekKey] = (month !== currentMonth || week !== currentWeek);
                        }
                    });
                });
                return newCollapsedState;
            });
        }
    }, [schedule, groupSchedule]);


    const toggleCollapse = (key) => {
        setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const upsertRecord = async (item, updates) => {
        const payload = {
            subject_id: item.subject_id,
            date: item.date,
            duration: item.duration,
            ...updates
        };
        try {
            const { data: updatedDbRecord } = await apiClient.post('/attendance/upsert', payload);
            // This call to the parent triggers the re-render that was causing the issue
            onAttendanceUpdate(updatedDbRecord);
        } catch (error) {
            console.error("API Error:", error);
            alert("Failed to update record.");
        }
    };

    const handlePersonalStatusChange = (item, clickedStatus) => {
        const newPersonalStatus = item.personal_status === clickedStatus ? null : clickedStatus;
        upsertRecord(item, { personal_status: newPersonalStatus });
    };

    const handleOfficialStatusChange = (item, newOfficialStatus) => {
        if (newOfficialStatus === 'no_class') {
            const reason = window.prompt("Reason for no class (e.g., Holiday, Professor Absent):");
            if (reason) upsertRecord(item, { status: 'no_class', reason: reason, personal_status: null });
        } else {
            upsertRecord(item, { status: newOfficialStatus, reason: null });
        }
    };
    
    const handleBulkMarkDay = async (date) => {
        const reason = window.prompt("Reason for no class on this day (e.g., Holiday, Sick Day):");
        if (!reason) return;
        const classesOnDay = schedule.filter(item => item.date === date);
        const recordsToUpdate = classesOnDay.map(item => ({ 
            subject_id: item.subject_id, 
            date: item.date, 
            duration: item.duration, 
            status: 'no_class', 
            reason: reason, 
            personal_status: null 
        }));
        try {
            const { data } = await apiClient.post('/attendance/bulk', { records: recordsToUpdate });
            onBulkUpdate(data);
        } catch (error) {
             alert("Failed to bulk update records.");
        }
    };

    if (!schedule.length) return (<div className="panel" style={{ textAlign: 'center', marginTop: '2rem' }}><h3>No Schedule Found</h3><p>Go to Settings to set your active semester dates, then add subjects.</p></div>);

    const groupedSchedule = groupSchedule(schedule);

    // The JSX part of the component remains the same
    return (
        <div className="panel" style={{ marginTop: '2rem' }}>
             <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Class Schedule & Attendance</h3>
             {Object.keys(groupedSchedule).sort((a, b) => new Date(b) - new Date(a)).map(month => (
                 <div key={month} className="collapsible-section">
                    <div className="collapsible-header month-header" onClick={() => toggleCollapse(month)}><span className={`collapse-icon ${!collapsedSections[month] ? 'expanded' : ''}`}>▶</span>{month}</div>
                     {!collapsedSections[month] && (
                         <div className="collapsible-content">
                            {Object.keys(groupedSchedule[month]).sort((a,b) => parseInt(b.split(' ')[1]) - parseInt(a.split(' ')[1])).map(week => (
                                 <div key={week} className="collapsible-section">
                                    <div className="collapsible-header week-header" onClick={() => toggleCollapse(`${month}-${week}`)}><span className={`collapse-icon ${!collapsedSections[`${month}-${week}`] ? 'expanded' : ''}`}>▶</span>{week}</div>
                                     {!collapsedSections[`${month}-${week}`] && (
                                         <div className="collapsible-content">
                                            {Object.entries(groupedSchedule[month][week].reduce((acc, item) => { if (!acc[item.date]) acc[item.date] = []; acc[item.date].push(item); return acc; }, {})).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)).map(([date, items]) => (
                                                 <div key={date} className="day-group">
                                                    <div className="day-header"><strong>{new Date(date + 'T00:00:00').toDateString()}</strong><button onClick={() => handleBulkMarkDay(date)} className="btn-edit btn-small">Mark Day as No Class</button></div>
                                                     <table className="schedule-table"><tbody>
                                                        {items.map((item) => (
                                                             <tr key={item.id} className={item.status === 'no_class' ? 'no-class-row' : ''}>
                                                                <td>{item.subject_code} - {item.subject_name}</td>
                                                                <td>
                                                                    <div className="schedule-actions">
                                                                        {item.status === 'no_class' 
                                                                            ? (<div className="no-class-display"><span>❌</span><span className="no-class-reason">{item.reason}</span></div>) 
                                                                            : (<><button onClick={() => handlePersonalStatusChange(item, 'present')} className={`btn-attendance present ${item.personal_status === 'present' ? 'active' : ''}`}>Present</button><button onClick={() => handlePersonalStatusChange(item, 'absent')} className={`btn-attendance absent ${item.personal_status === 'absent' ? 'active' : ''}`}>Absent</button></>)
                                                                        }
                                                                        <select className="form-select action-dropdown" value={item.status} onChange={(e) => handleOfficialStatusChange(item, e.target.value)}>
                                                                            <option value="not_taken">Not Taken</option>
                                                                            <option value="present">Official Present</option>
                                                                            <option value="absent">Official Absent</option>
                                                                            <option value="no_class">No Class</option>
                                                                        </select>
                                                                    </div>
                                                                </td>
                                                             </tr>
                                                        ))}
                                                     </tbody></table>
                                                 </div>
                                            ))}
                                         </div>
                                     )}
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             ))}
         </div>
    );
}

export default ScheduleDisplay;