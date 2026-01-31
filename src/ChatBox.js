import React, { useEffect, useRef } from 'react';
import './ChatBox.css';

const ChatBox = ({ messages, onSendMessage, userName }) => {
    const messagesEndRef = useRef(null);
    const inputRef = useRef('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (inputRef.current.value.trim()) {
            onSendMessage({
                text: inputRef.current.value,
                userName: userName,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            inputRef.current.value = '';
            inputRef.current.focus();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chat-box">
            <div className="chat-header">
                <h3>💬 Chat</h3>
            </div>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <p>No messages yet. Start chatting!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.isOwn ? 'own' : 'other'}`}>
                            <div className="message-content">
                                <span className="sender-name">{msg.userName}</span>
                                <p className="message-text">{msg.text}</p>
                                <span className="message-time">{msg.timestamp}</span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <textarea
                    ref={inputRef}
                    className="chat-input"
                    placeholder="Type your message... (Shift+Enter for new line)"
                    onKeyPress={handleKeyPress}
                    rows="2"
                />
                <button className="send-btn" onClick={handleSendMessage}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatBox;
