import React, { useRef, useState } from 'react';
import './Whiteboard.css';

const Whiteboard = ({ isOpen, onClose, isActive }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [size, setSize] = useState(2);

    if (!isOpen) return null;

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = color;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');

        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const downloadWhiteboard = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = `whiteboard-${Date.now()}.png`;
        link.click();
    };

    return (
        <div className="whiteboard-modal">
            <div className="whiteboard-container">
                <div className="whiteboard-toolbar">
                    <div className="toolbar-group">
                        <label>Color:</label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="color-picker"
                        />
                    </div>

                    <div className="toolbar-group">
                        <label>Size:</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="size-slider"
                        />
                        <span className="size-value">{size}px</span>
                    </div>

                    <button className="toolbar-btn clear-btn" onClick={clearCanvas}>
                        🗑️ Clear
                    </button>
                    <button className="toolbar-btn download-btn" onClick={downloadWhiteboard}>
                        ⬇️ Save
                    </button>
                    <button className="toolbar-btn close-btn" onClick={onClose}>
                        ✕ Close
                    </button>
                </div>

                <canvas
                    ref={canvasRef}
                    className="whiteboard-canvas"
                    width={800}
                    height={600}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                />
            </div>
        </div>
    );
};

export default Whiteboard;
