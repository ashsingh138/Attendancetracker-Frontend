import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const AttendanceCalendar = ({ schedule }) => {
    const dailyStatus = schedule.reduce((acc, item) => {
        const date = item.date;
        if (!acc[date]) {
            acc[date] = { present: 0, absent: 0, no_class: 0, not_marked: 0 };
        }
        if (item.status === 'no_class') {
            acc[date].no_class++;
        } else if (item.personal_status === 'present') {
            acc[date].present++;
        } else if (item.personal_status === 'absent') {
            acc[date].absent++;
        } else {
            acc[date].not_marked++;
        }
        return acc;
    }, {});

    const calendarEvents = Object.keys(dailyStatus).map(date => {
        const status = dailyStatus[date];
        let dayClass = 'event-neutral'; // Default for days with no marked attendance or mixed
        let title = `${status.present}P / ${status.absent}A`;

        if (status.no_class > 0 && status.present === 0 && status.absent === 0) {
            dayClass = 'event-holiday';
            title = 'No Classes';
        } else if (status.absent > 0 && status.present === 0) {
            dayClass = 'event-absent';
        } else if (status.present > 0 && status.absent > 0) {
            dayClass = 'event-mixed';
        } else if (status.present > 0 && status.absent === 0) {
            dayClass = 'event-perfect';
        }

        return {
            start: new Date(date + 'T00:00:00'),
            end: new Date(date + 'T23:59:59'),
            title: title,
            allDay: true,
            resource: dayClass,
        };
    });

    const eventStyleGetter = (event) => {
        return { className: event.resource };
    };

    return (
        <div className="panel" style={{ height: '80vh' }}>
            <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                eventPropGetter={eventStyleGetter}
                views={['month']}
            />
        </div>
    );
};

export default AttendanceCalendar;