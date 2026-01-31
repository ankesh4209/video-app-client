import React, { useState } from 'react';
import './SettingsPanel.css';

const SettingsPanel = ({ isOpen, onClose, settings, onSettingsChange }) => {
    const [encryption, setEncryption] = useState(settings.encryption || false);
    const [quality, setQuality] = useState(settings.quality || 'medium');
    const [autoRecord, setAutoRecord] = useState(settings.autoRecord || false);
    const [notifications, setNotifications] = useState(settings.notifications || true);

    const handleChange = (key, value) => {
        onSettingsChange(key, value);
    };

    if (!isOpen) return null;

    return (
        <div className="settings-modal" onClick={onClose}>
            <div className="settings-card" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h3>⚙️ Settings</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="settings-content">
                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={encryption}
                                onChange={(e) => {
                                    setEncryption(e.target.checked);
                                    handleChange('encryption', e.target.checked);
                                }}
                            />
                            🔐 End-to-End Encryption
                        </label>
                        <p className="setting-hint">Encrypt all communications</p>
                    </div>

                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={autoRecord}
                                onChange={(e) => {
                                    setAutoRecord(e.target.checked);
                                    handleChange('autoRecord', e.target.checked);
                                }}
                            />
                            ⏹️ Auto Record Meeting
                        </label>
                        <p className="setting-hint">Automatically record when you start</p>
                    </div>

                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={notifications}
                                onChange={(e) => {
                                    setNotifications(e.target.checked);
                                    handleChange('notifications', e.target.checked);
                                }}
                            />
                            🔔 Notifications
                        </label>
                        <p className="setting-hint">Show notifications for new users</p>
                    </div>

                    <div className="setting-item">
                        <label htmlFor="quality">📹 Video Quality</label>
                        <select
                            id="quality"
                            value={quality}
                            onChange={(e) => {
                                setQuality(e.target.value);
                                handleChange('quality', e.target.value);
                            }}
                            className="quality-select"
                        >
                            <option value="low">Low (360p)</option>
                            <option value="medium">Medium (480p)</option>
                            <option value="high">High (720p)</option>
                            <option value="ultra">Ultra (1080p)</option>
                        </select>
                        <p className="setting-hint">Higher quality uses more bandwidth</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
