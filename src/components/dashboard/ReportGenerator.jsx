import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function ReportGenerator({ user, profile, semester, subjects, schedule }) {

    const handleGeneratePdf = () => {
        if (!semester) {
            alert("Please set an active semester to generate a report.");
            return;
        }

        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Attendance Report", 14, 22);
        doc.setFontSize(12);
        doc.text(`Name: ${profile?.full_name || user.email}`, 14, 32);
        doc.text(`Semester: ${semester.name || ''} - ${semester.year || ''}`, 14, 40);
        doc.text(`Period: ${new Date(semester.start_date).toLocaleDateString()} to ${new Date(semester.end_date).toLocaleDateString()}`, 14, 48);
        
        const tableColumn = ["Code", "Subject", "Professor", "Personal Attended", "Personal Total", "Personal %", "Official Attended", "Official Total", "Official %"];
        const tableRows = [];

        const validPastClasses = schedule.filter(item => item.status !== 'no_class' && new Date(item.date) <= new Date());

        subjects.forEach(subject => {
            const personalClasses = validPastClasses.filter(item => item.subject_id === subject._id);
            const personalTotalHours = personalClasses.reduce((acc, item) => acc + (item.duration || 0), 0);
            const personalAttendedHours = personalClasses.filter(item => item.personal_status === 'present').reduce((acc, item) => acc + (item.duration || 0), 0);
            const personalPercentage = personalTotalHours > 0 ? ((personalAttendedHours / personalTotalHours) * 100).toFixed(1) : 'N/A';

            const officialClasses = validPastClasses.filter(item => item.subject_id === subject._id && (item.status === 'present' || item.status === 'absent'));
            const officialTotalHours = officialClasses.reduce((acc, item) => acc + (item.duration || 0), 0);
            const officialAttendedHours = officialClasses.filter(item => item.status === 'present').reduce((acc, item) => acc + (item.duration || 0), 0);
            const officialPercentage = officialTotalHours > 0 ? ((officialAttendedHours / officialTotalHours) * 100).toFixed(1) : 'N/A';

            const subjectData = [
                subject.subject_code,
                subject.subject_name,
                subject.professor_name || '-',
                `${personalAttendedHours} hrs`,
                `${personalTotalHours} hrs`,
                `${personalPercentage}%`,
                `${officialAttendedHours} hrs`,
                `${officialTotalHours} hrs`,
                `${officialPercentage}%`
            ];
            tableRows.push(subjectData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 56,
        });

        doc.save(`Attendance_Report_${semester?.name || 'Semester'}.pdf`);
    };

    return (
        <div className="panel" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Generate Reports</h3>
            <p style={{marginTop: 0, color: 'var(--text-secondary)'}}>
                Download a full PDF summary of your attendance for the current active semester.
            </p>
            <button className="btn btn-primary" onClick={handleGeneratePdf}>Generate Detailed PDF Report</button>
        </div>
    );
}

export default ReportGenerator;