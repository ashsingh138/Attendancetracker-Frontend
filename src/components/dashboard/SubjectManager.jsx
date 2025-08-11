import React, { useState, useEffect } from 'react';
import apiClient from '../../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// --- Inner Component: SubjectTrendGraph ---
const SubjectTrendGraph = ({ subject, schedule }) => {
    const subjectClasses = schedule
        .filter(item => item.subject_id === subject._id && item.status !== 'no_class' && new Date(item.date) <= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    let attended = 0;
    let total = 0;
    const trendData = subjectClasses.map(item => {
        total += item.duration;
        if (item.personal_status === 'present') {
            attended += item.duration;
        }
        return {
            date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            percentage: total > 0 ? (attended / total) * 100 : 100,
        };
    });

    const data = {
        labels: trendData.map(d => d.date),
        datasets: [{
            label: 'Attendance % Trend',
            data: trendData.map(d => d.percentage),
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            tension: 0.2,
        }],
    };
    
    const options = { responsive: true, scales: { y: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false }}};
    return <Line data={data} options={options} />;
};

// --- Inner Component: SubjectStats ---
const SubjectStats = ({ subject, schedule }) => {
    const totalSemesterClasses = schedule.filter(s => s.subject_id === subject._id);
    const validPastClasses = totalSemesterClasses.filter(item => item.status !== 'no_class' && new Date(item.date) <= new Date());
    const overallTotalHours = validPastClasses.reduce((acc, item) => acc + (item.duration || 0), 0);
    const overallAttendedHours = validPastClasses.filter(item => item.personal_status === 'present').reduce((acc, item) => acc + (item.duration || 0), 0);
    const currentPercentage = overallTotalHours > 0 ? (overallAttendedHours / overallTotalHours) * 100 : 100;
    const officialClasses = validPastClasses.filter(item => item.status === 'present' || item.status === 'absent');
    const officialTotalHours = officialClasses.reduce((acc, item) => acc + (item.duration || 0), 0);
    const officialAttendedHours = officialClasses.filter(item => item.status === 'present').reduce((acc, item) => acc + (item.duration || 0), 0);
    const officialPercentage = officialTotalHours > 0 ? ((officialAttendedHours / officialTotalHours) * 100).toFixed(1) : 'N/A';
    const goal = subject.attendance_goal || 75;
    const totalSemesterHours = totalSemesterClasses.reduce((acc, item) => acc + (item.duration || 0), 0);
    const futureHours = totalSemesterHours - overallTotalHours;
    const bunkableHours = Math.floor(overallAttendedHours + futureHours - (goal / 100) * totalSemesterHours);
    const catchUpHours = Math.ceil(((goal / 100) * totalSemesterHours - overallAttendedHours) / (1 - (goal / 100)));

    return (
        <div className="subject-stats-container">
            <div className="goal-progress"><div className="progress-bar-labels"><span>Your %: {currentPercentage.toFixed(1)}%</span><span>Goal: {goal}%</span></div><div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${currentPercentage}%` }}></div><div className="progress-bar-goal" style={{ left: `${goal}%` }}></div></div></div>
            <div className="subject-stats-grid">
                <div className="subject-stat"><h5>Personal Attended</h5><p>{overallAttendedHours} hrs</p></div>
                <div className="subject-stat"><h5>Personal Total</h5><p>{overallTotalHours} hrs</p></div>
                <div className="subject-stat"><h5>Personal %</h5><p>{currentPercentage.toFixed(1)}%</p></div>
                <div className="subject-stat"><h5>Official Attended</h5><p>{officialAttendedHours} hrs</p></div>
                <div className="subject-stat"><h5>Official Total</h5><p>{officialTotalHours} hrs</p></div>
                <div className="subject-stat"><h5>Official %</h5><p>{officialPercentage}%</p></div>
            </div>
            <div className="predictors-grid">{currentPercentage >= goal ? (<div className="predictor-panel success"><h5>Bunk Meter</h5><p>You can miss up to <strong>{bunkableHours < 0 ? 0 : bunkableHours} more hours</strong> and still meet your goal.</p></div>) : (<div className="predictor-panel warning"><h5>Catch-Up Calculator</h5>{catchUpHours > 0 && catchUpHours <= futureHours ? (<p>You must attend the next <strong>{catchUpHours} consecutive hours</strong> to reach your goal.</p>) : (<p>Your {goal}% attendance goal is no longer reachable this semester.</p>)}</div>)}</div>
        </div>
    );
};

// --- Inner Component: SubjectForm ---
function SubjectForm({ subject, onSave, onCancel, semesterId }) {
    const [subjectCode, setSubjectCode] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [professorName, setProfessorName] = useState('');
    const [scheduleSlots, setScheduleSlots] = useState([{ day: 'Monday', start_time: '09:00', duration: 1 }]);
    const [attendanceGoal, setAttendanceGoal] = useState(75);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (subject) {
            setSubjectCode(subject.subject_code);
            setSubjectName(subject.subject_name);
            setProfessorName(subject.professor_name || '');
            setScheduleSlots(subject.schedule?.length > 0 ? subject.schedule.map(s => ({...s, start_time: s.start_time || '09:00'})) : [{ day: 'Monday', start_time: '09:00', duration: 1 }]);
            setAttendanceGoal(subject.attendance_goal || 75);
        } else {
            setSubjectCode(''); setSubjectName(''); setProfessorName('');
            setScheduleSlots([{ day: 'Monday', start_time: '09:00', duration: 1 }]);
            setAttendanceGoal(75);
        }
    }, [subject]);

    const handleSlotChange = (index, field, value) => {
        const newSlots = [...scheduleSlots];
        newSlots[index][field] = field === 'duration' ? Number(value) : value;
        setScheduleSlots(newSlots);
    };

    const addSlot = () => setScheduleSlots([...scheduleSlots, { day: 'Monday', start_time: '09:00', duration: 1 }]);
    const removeSlot = (index) => setScheduleSlots(scheduleSlots.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!semesterId) {
            alert("Please set an active semester before adding subjects."); setLoading(false); return;
        }
        const payload = { semester_id: semesterId, subject_code: subjectCode, subject_name: subjectName, professor_name: professorName, schedule: scheduleSlots, attendance_goal: attendanceGoal };
        try {
            if (subject) { await apiClient.put(`/subjects/${subject._id}`, payload); } else { await apiClient.post('/subjects', payload); }
            onSave();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save subject');
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{subject ? 'Edit Subject' : 'Add New Subject'}</h3>
            <div className="form-grid">
                <input type="text" placeholder="Code (e.g., CS101)" value={subjectCode} onChange={e => setSubjectCode(e.target.value)} className="form-input" required />
                <input type="text" placeholder="Subject Name" value={subjectName} onChange={e => setSubjectName(e.target.value)} className="form-input" required />
                <input type="text" placeholder="Professor Name" value={professorName} onChange={e => setProfessorName(e.target.value)} className="form-input" />
                <input type="number" placeholder="Goal %" value={attendanceGoal} min="1" max="100" onChange={e => setAttendanceGoal(Number(e.target.value))} className="form-input" required />
            </div>
            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#9ca3af' }}>Class Schedule</h4>
            {scheduleSlots.map((slot, index) => (
                <div key={index} className="form-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <select value={slot.day} onChange={e => handleSlotChange(index, 'day', e.target.value)} className="form-select">{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    <input type="time" value={slot.start_time} onChange={e => handleSlotChange(index, 'start_time', e.target.value)} className="form-input" required />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="number" placeholder="Hours" value={slot.duration} min="1" onChange={e => handleSlotChange(index, 'duration', e.target.value)} className="form-input" required />
                        {scheduleSlots.length > 1 && <button type="button" onClick={() => removeSlot(index)} className="btn-danger-small">X</button>}
                    </div>
                </div>
            ))}
            <button type="button" onClick={addSlot} className="action-btn" style={{ marginRight: '1rem' }}>+ Add Day</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (subject ? 'Update Subject' : 'Add Subject')}</button>
            {subject && <button type="button" onClick={onCancel} className="action-btn" style={{ marginLeft: '1rem' }}>Cancel</button>}
        </form>
    );
}

// --- Main SubjectManager Component ---
function SubjectManager({ subjects, schedule, onUpdate, semesterId }) {
    const [isEditing, setIsEditing] = useState(null);
    const [expandedGraph, setExpandedGraph] = useState(null);

    const handleSaveSuccess = () => { 
        onUpdate(); 
        setIsEditing(null); 
    };

    const deleteSubject = async (id) => {
        if (window.confirm("Are you sure? This will delete the subject and ALL its related attendance, test, and assignment records permanently.")) {
            try { 
                await apiClient.delete(`/subjects/${id}`); 
                onUpdate(); 
            } catch (error) { 
                alert(error.response?.data?.message || 'Failed to delete subject'); 
            }
        }
    };

    const handleExportCsv = (subject) => {
        const subjectRecords = schedule
            .filter(item => item.subject_id === subject._id && new Date(item.date) < new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (subjectRecords.length === 0) {
            alert("No past attendance records to export for this subject.");
            return;
        }

        const headers = ["Date", "Day", "Official Status", "Your Status", "Duration (hrs)"];
        const csvRows = [headers.join(',')]; 

        subjectRecords.forEach(record => {
            const row = [ 
                new Date(record.date + 'T00:00:00').toLocaleDateString(), 
                days[new Date(record.date + 'T00:00:00').getDay()], 
                record.status, 
                record.personal_status || 'not_marked', 
                record.duration
            ];
            csvRows.push(row.map(val => `"${val}"`).join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${subject.subject_code}_attendance.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="panel">
            {isEditing ? (
                <SubjectForm 
                    subject={isEditing} 
                    onSave={handleSaveSuccess} 
                    onCancel={() => setIsEditing(null)} 
                    semesterId={semesterId}
                />
            ) : (
            <>
                <SubjectForm onSave={handleSaveSuccess} semesterId={semesterId}/>
                <h3 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    Your Subjects & Stats
                </h3>
                <div className="subject-list-container">
                    {subjects.length === 0 && semesterId && (
                        <p>No subjects added for this semester yet. Add one above to get started.</p>
                    )}
                    {subjects.map(s => (
                        <div key={s._id} className="subject-card">
                            <div className="subject-card-header">
                                <div>
                                    <h4>{s.subject_code}: {s.subject_name}</h4>
                                    {s.professor_name && <p className="professor-name">{s.professor_name}</p>}
                                </div>
                                <div className="subject-card-actions">
                                    <button onClick={() => handleExportCsv(s)} className="btn-edit">Export CSV</button>
                                    <button onClick={() => setExpandedGraph(expandedGraph === s._id ? null : s._id)} className="btn-edit">{expandedGraph === s._id ? 'Hide' : 'Trend'}</button>
                                    <button onClick={() => setIsEditing(s)} className="btn-edit">Edit</button>
                                    <button onClick={() => deleteSubject(s._id)} className="btn-danger-small">Delete</button>
                                </div>
                            </div>
                            {expandedGraph === s._id && <div className="trend-graph-container"><SubjectTrendGraph subject={s} schedule={schedule} /></div>}
                            <SubjectStats subject={s} schedule={schedule} />
                        </div>
                    ))}
                </div>
            </>
            )}
        </div>
    );
}

export default SubjectManager;