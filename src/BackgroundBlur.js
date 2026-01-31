import React, { useState } from 'react';
import './BackgroundBlur.css';

const BackgroundBlur = ({ isEnabled, onToggle }) => {
    return (
        <div className="background-blur-widget">
            <button
                className={`blur-btn ${isEnabled ? 'active' : ''}`}
                onClick={onToggle}
                title="Toggle background blur"
            >
                🌫️ Background {isEnabled ? 'Blur ON' : 'Blur OFF'}
            </button>
            {isEnabled && <span className="blur-indicator">✓ Blurred</span>}
        </div>
    );
};

export default BackgroundBlur;
