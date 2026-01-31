import React from 'react';
import './RaiseHand.css';

const RaiseHand = ({ isRaised, onToggle, raisedUsers = [] }) => {
    return (
        <div className="raise-hand-section">
            <button
                className={`raise-hand-btn ${isRaised ? 'active' : ''}`}
                onClick={onToggle}
                title="Raise hand to speak"
            >
                ✋ {isRaised ? 'Hand Raised' : 'Raise Hand'}
            </button>

            {raisedUsers.length > 0 && (
                <div className="raised-users">
                    <p className="raised-label">🖐️ Hands Raised ({raisedUsers.length})</p>
                    <ul className="raised-list">
                        {raisedUsers.map((user, idx) => (
                            <li key={idx} className="raised-item">
                                {user}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default RaiseHand;
