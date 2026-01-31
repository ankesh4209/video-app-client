import React from 'react';
import './Avatar.css';
import { getAvatarColor, getInitials } from './utils';

const Avatar = ({ name = 'User', size = 'md', online = true }) => {
    const color = getAvatarColor(name);
    const initials = getInitials(name);

    const sizeMap = {
        sm: '32px',
        md: '48px',
        lg: '64px',
        xl: '80px'
    };

    return (
        <div className={`avatar avatar-${size} ${online ? 'online' : 'offline'}`}>
            <div
                className="avatar-circle"
                style={{
                    width: sizeMap[size],
                    height: sizeMap[size],
                    backgroundColor: color
                }}
            >
                <span className="avatar-initials">{initials}</span>
            </div>
            {online && <div className="avatar-status"></div>}
        </div>
    );
};

export default Avatar;
