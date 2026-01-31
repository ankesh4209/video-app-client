import React, { useState } from 'react';
import './MeetingCode.css';

const MeetingCode = ({ code, onCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`Join my meeting: ${window.location.href}?code=${code}`);
        setCopied(true);
        onCopy?.();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="meeting-code-container">
            <div className="meeting-code-card">
                <div className="code-icon">🔗</div>
                <div className="code-content">
                    <p className="code-label">Meeting Code</p>
                    <p className="code-value">{code}</p>
                </div>
                <button
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopy}
                    title="Copy meeting link"
                >
                    {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
            </div>
        </div>
    );
};

export default MeetingCode;
