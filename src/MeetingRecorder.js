import React, { useState } from 'react';
import './MeetingRecorder.css';

const MeetingRecorder = ({ isRecording, onToggleRecord, duration }) => {
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="recorder-widget">
            <button
                className={`record-btn ${isRecording ? 'recording' : ''}`}
                onClick={onToggleRecord}
                title={isRecording ? 'Stop recording' : 'Start recording'}
            >
                <span className={`record-dot ${isRecording ? 'active' : ''}`}></span>
                {isRecording ? '⏹ Stop' : '⏸ Record'}
            </button>

            {isRecording && (
                <div className="recording-indicator">
                    <span className="rec-dot"></span>
                    <span className="rec-time">{formatTime(duration)}</span>
                </div>
            )}
        </div>
    );
};

export default MeetingRecorder;
