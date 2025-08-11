import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

const SubjectTrendChart = ({ subject, schedule }) => {
    const subjectClasses = schedule.filter(item => item.subject_id === subject._id && new Date(item.date) <= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
    let overallAttended = 0, overallTotal = 0, officialAttended = 0, officialTotal = 0;
    const trendData = subjectClasses.map(item => {
        if (item.status !== 'no_class') {
            overallTotal += item.duration;
            if (item.personal_status === 'present') overallAttended += item.duration;
        }
        if (item.status === 'present' || item.status === 'absent') {
            officialTotal += item.duration;
            if (item.status === 'present') officialAttended += item.duration;
        }
        return {
            date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            overallPercentage: overallTotal > 0 ? (overallAttended / overallTotal) * 100 : 100,
            officialPercentage: officialTotal > 0 ? (officialAttended / officialTotal) * 100 : 100,
        };
    });
    const data = {
        labels: trendData.map(d => d.date),
        datasets: [
            { label: 'Personal %', data: trendData.map(d => d.overallPercentage), borderColor: 'rgba(59, 130, 246, 1)', backgroundColor: 'rgba(59, 130, 246, 0.2)', fill: true, tension: 0.3 },
            { label: 'Official %', data: trendData.map(d => d.officialPercentage), borderColor: 'rgba(16, 185, 129, 1)', backgroundColor: 'rgba(16, 185, 129, 0.2)', fill: true, tension: 0.3 }
        ],
    };
    const options = { responsive: true, plugins: { legend: { display: true, position: 'top' }, title: { display: true, text: `${subject.subject_code}: ${subject.subject_name}`, font: { size: 14 }}}, scales: { y: { beginAtZero: true, max: 100 }}};
    return <Line data={data} options={options} />;
};

function DashboardCharts({ subjects, schedule, semester }) {
    const validPastSchedule = schedule.filter(item => new Date(item.date) <= new Date());
    const overallValid = validPastSchedule.filter(item => item.status !== 'no_class');
    const overallAttended = overallValid.filter(item => item.personal_status === 'present').reduce((acc, item) => acc + (item.duration || 0), 0);
    const overallMissed = overallValid.filter(item => item.personal_status === 'absent').reduce((acc, item) => acc + (item.duration || 0), 0);
    const overallPieData = { labels: ['Attended (Personal)', 'Missed (Personal)'], datasets: [{ data: [overallAttended, overallMissed], backgroundColor: ['#3b82f6', '#f87171'] }]};
    const overallPieOptions = { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Overall Attendance (Personal)' }}};

    const officialValid = validPastSchedule.filter(item => item.status === 'present' || item.status === 'absent');
    const officialAttended = officialValid.filter(item => item.status === 'present').reduce((acc, item) => acc + (item.duration || 0), 0);
    const officialMissed = officialValid.filter(item => item.status === 'absent').reduce((acc, item) => acc + (item.duration || 0), 0);
    const officialPieData = { labels: ['Attended (Official)', 'Missed (Official)'], datasets: [{ data: [officialAttended, officialMissed], backgroundColor: ['#10b981', '#ef4444'] }]};
    const officialPieOptions = { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Official Attendance' }}};

    const barLabels = subjects.map(s => s.subject_code);
    const overallPercentages = subjects.map(subject => {
        const subjectSchedule = overallValid.filter(s => s.subject_id === subject._id);
        const total = subjectSchedule.reduce((acc, item) => acc + (item.duration || 0), 0);
        const attended = subjectSchedule.filter(item => item.personal_status === 'present').reduce((acc, item) => acc + (item.duration || 0), 0);
        return total > 0 ? (attended / total * 100) : 0;
    });
    const officialPercentages = subjects.map(subject => {
        const subjectSchedule = officialValid.filter(s => s.subject_id === subject._id);
        const total = subjectSchedule.reduce((acc, item) => acc + (item.duration || 0), 0);
        const attended = subjectSchedule.filter(item => item.status === 'present').reduce((acc, item) => acc + (item.duration || 0), 0);
        return total > 0 ? (attended / total * 100) : 0;
    });
    const barData = {
        labels: barLabels,
        datasets: [
            { label: 'Personal %', data: overallPercentages, backgroundColor: 'rgba(59, 130, 246, 0.7)' },
            { label: 'Official %', data: officialPercentages, backgroundColor: 'rgba(16, 185, 129, 0.7)' }
        ],
    };
    const barOptions = { responsive: true, plugins: { legend: { display: true, position: 'top' }, title: { display: true, text: 'Attendance Percentage per Subject' }}, scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' }}}};
    
    if(!semester) return <div className="panel" style={{ textAlign: 'center', marginTop: '2rem' }}><h3>Welcome to Attendance Pro!</h3><p>To get started, go to Settings and set up your first active semester.</p></div>

    return (
        <div className="panel" style={{ marginTop: '2rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                {semester.name} - {semester.year}
            </h2>
            <div className="charts-container" style={{ marginBottom: '2.5rem' }}>
                <div className="chart-wrapper" style={{maxWidth: '280px'}}><Pie data={overallPieData} options={overallPieOptions} /></div>
                <div className="chart-wrapper" style={{maxWidth: '280px'}}><Pie data={officialPieData} options={officialPieOptions} /></div>
                <div className="chart-wrapper" style={{flexGrow: 1}}><Bar options={barOptions} data={barData} /></div>
            </div>
            <h3 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                Subject Trends
            </h3>
            <div className="charts-container" style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                {subjects.map(subject => (
                    <div key={subject._id} className="chart-wrapper" style={{ flexBasis: 'calc(50% - 1rem)', minWidth: '300px', flexGrow: 1 }}>
                        <SubjectTrendChart subject={subject} schedule={schedule} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DashboardCharts;