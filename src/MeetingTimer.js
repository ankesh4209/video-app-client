import React from 'react';
import './MeetingTimer.css';

const MeetingTimer = ({ duration }) => {
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="meeting-timer">
            <span className="timer-label">⏱️ Duration</span>
            <span className="timer-value">{formatTime(duration)}</span>
        </div>
    );
};

export default MeetingTimer;
