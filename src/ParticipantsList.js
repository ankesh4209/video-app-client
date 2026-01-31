import React from 'react';
import Avatar from './Avatar';
import './ParticipantsList.css';

const ParticipantsList = ({ users, currentUser, onRemoveUser, isAdmin }) => {
    const allUsers = [{ ...currentUser, socketId: 'self', isYou: true }, ...users];

    return (
        <div className="participants-panel">
            <div className="participants-header">
                <h3>👥 Participants ({allUsers.length})</h3>
            </div>

            <div className="participants-list">
                {allUsers.map(user => (
                    <div key={user.socketId} className="participant-item">
                        <div className="participant-info">
                            <Avatar name={user.userName} size="sm" online={true} />
                            <div className="participant-details">
                                <span className="participant-name">
                                    {user.userName}
                                    {user.isYou && <span className="you-badge">You</span>}
                                </span>
                                <span className="participant-status">
                                    {user.isMuted ? '🔇 Muted' : '🎙️ Active'}
                                    {user.isVideoOff ? ' • 📹 Off' : ''}
                                </span>
                            </div>
                        </div>
                        {isAdmin && !user.isYou && (
                            <div className="participant-actions">
                                <button
                                    className="admin-btn remove-btn"
                                    onClick={() => onRemoveUser(user.socketId)}
                                    title="Remove user"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParticipantsList;
