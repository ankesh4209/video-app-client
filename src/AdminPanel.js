import React from 'react';
import './AdminPanel.css';

const AdminPanel = ({ isAdmin, onMuteAll, onLockRoom, isRoomLocked }) => {
    if (!isAdmin) return null;

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h4>🔐 Admin Controls</h4>
            </div>

            <div className="admin-controls">
                <button className="admin-control-btn mute-all" onClick={onMuteAll}>
                    🔇 Mute All
                </button>
                <button
                    className={`admin-control-btn lock-room ${isRoomLocked ? 'locked' : ''}`}
                    onClick={onLockRoom}
                >
                    {isRoomLocked ? '🔒 Room Locked' : '🔓 Lock Room'}
                </button>
            </div>
        </div>
    );
};

export default AdminPanel;
