import React, { useState } from 'react';
import './FileSharing.css';

const FileSharing = ({ onFileSelect, messages }) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            alert('File too large. Maximum size is 50MB');
            return;
        }
        onFileSelect(file);
    };

    const fileMessages = messages.filter(m => m.file);

    return (
        <div className="file-sharing">
            <div
                className={`drop-zone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-input"
                    onChange={handleChange}
                    className="file-input"
                    accept="*/*"
                />
                <label htmlFor="file-input" className="file-label">
                    📎 Click or drag file
                </label>
            </div>

            {fileMessages.length > 0 && (
                <div className="shared-files">
                    <p className="files-title">📁 Shared Files</p>
                    {fileMessages.map((msg, idx) => (
                        <div key={idx} className="file-item">
                            <span className="file-name">{msg.file?.name}</span>
                            <button
                                className="download-link"
                                onClick={() => downloadFile(msg.file)}
                            >
                                ⬇️ Download
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const downloadFile = (file) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
};

export default FileSharing;
