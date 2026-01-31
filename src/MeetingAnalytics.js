import React, { useState } from 'react';
import './MeetingAnalytics.css';

const MeetingAnalytics = ({ isOpen, onClose, stats }) => {
    if (!isOpen) return null;

    const defaultStats = {
        participantsJoined: 0,
        averageParticipants: 0,
        totalDuration: 0,
        screensharesCount: 0,
        messagesCount: 0,
        filesShared: 0,
        ...stats
    };

    return (
        <div className="analytics-modal" onClick={onClose}>
            <div className="analytics-card" onClick={(e) => e.stopPropagation()}>
                <div className="analytics-header">
                    <h3>📊 Meeting Analytics</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="analytics-grid">
                    <div className="stat-item">
                        <span className="stat-icon">👥</span>
                        <span className="stat-label">Participants</span>
                        <span className="stat-value">{defaultStats.participantsJoined}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-icon">⏱️</span>
                        <span className="stat-label">Duration</span>
                        <span className="stat-value">{Math.round(defaultStats.totalDuration / 60)}m</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-icon">📺</span>
                        <span className="stat-label">Screen Shares</span>
                        <span className="stat-value">{defaultStats.screensharesCount}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-icon">💬</span>
                        <span className="stat-label">Messages</span>
                        <span className="stat-value">{defaultStats.messagesCount}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-icon">📁</span>
                        <span className="stat-label">Files Shared</span>
                        <span className="stat-value">{defaultStats.filesShared}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-icon">👨‍💼</span>
                        <span className="stat-label">Avg Present</span>
                        <span className="stat-value">{defaultStats.averageParticipants}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingAnalytics;
