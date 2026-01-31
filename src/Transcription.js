import React, { useState } from 'react';
import './Transcription.css';

const Transcription = ({ isOpen, onClose, transcript }) => {
    if (!isOpen) return null;

    const downloadTranscript = () => {
        const element = document.createElement('a');
        const file = new Blob([transcript.join('\n')], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `transcript-${Date.now()}.txt`;
        element.click();
    };

    return (
        <div className="transcription-modal" onClick={onClose}>
            <div className="transcription-card" onClick={(e) => e.stopPropagation()}>
                <div className="transcription-header">
                    <h3>📝 Meeting Transcript</h3>
                    <div className="transcription-actions">
                        <button className="download-btn" onClick={downloadTranscript}>
                            ⬇️ Download
                        </button>
                        <button className="close-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                <div className="transcription-content">
                    {transcript.length === 0 ? (
                        <p className="empty-transcript">No transcript available</p>
                    ) : (
                        <div className="transcript-list">
                            {transcript.map((text, idx) => (
                                <div key={idx} className="transcript-line">
                                    <span className="timestamp">[{Math.floor(idx / 10)}m]</span>
                                    <span className="text">{text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transcription;
