import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import ChatBox from './ChatBox';
import Avatar from './Avatar';
import ParticipantsList from './ParticipantsList';
import MeetingCode from './MeetingCode';
import RaiseHand from './RaiseHand';
import MeetingRecorder from './MeetingRecorder';
import Whiteboard from './Whiteboard';
import FileSharing from './FileSharing';
import BackgroundBlur from './BackgroundBlur';
import AdminPanel from './AdminPanel';
import MeetingTimer from './MeetingTimer';
import MeetingAnalytics from './MeetingAnalytics';
import SettingsPanel from './SettingsPanel';
import Transcription from './Transcription';
import { generateMeetingCode } from './utils';
import './VideoRoom.css';

const VideoRoom = () => {
  const socketRef = useRef();
  const peersRef = useRef([]);
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState();
  const [screenStream, setScreenStream] = useState();
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isBackgroundBlurred, setIsBackgroundBlurred] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [raisedUsers, setRaisedUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [meetingCode, setMeetingCode] = useState('');
  const [viewMode, setViewMode] = useState('gallery'); // gallery or speaker
  const [speakerPeerId, setSpeakerPeerId] = useState(null);
  const [settings, setSettings] = useState({
    encryption: false,
    quality: 'medium',
    autoRecord: false,
    notifications: true
  });

  const userVideo = useRef();
  const screenVideo = useRef();
  const userName = useRef();
  const mediaRecorderRef = useRef();
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef();

  useEffect(() => {
    // Generate meeting code
    const code = generateMeetingCode();
    setMeetingCode(code);

    // Auto record if enabled
    if (settings.autoRecord) {
      setTimeout(() => startRecording(), 1000);
    }

    // Get user media (camera/microphone)
    navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: getResolution(settings.quality).width } },
      audio: true
    })
      .then(stream => {
        setStream(stream);
        if (userVideo.current) userVideo.current.srcObject = stream;
      })
      .catch(error => console.error('Error accessing media devices:', error));

    // Initialize socket
    const SOCKET_SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_SERVER);
    userName.current = `User-${Math.random().toString(36).substr(2, 9)}`;

    // First user is admin
    setIsAdmin(users.length === 0);

    socketRef.current.emit('user-join', {
      userId: socketRef.current.id,
      userName: userName.current,
      isMuted: isMuted,
      isVideoOff: isVideoOff
    });

    // Meeting timer
    const meetingTimer = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);

    // Handle incoming signal
    socketRef.current.on('signal', ({ from, signal }) => {
      const peerConnection = peersRef.current.find(p => p.peerID === from);
      if (peerConnection) {
        peerConnection.peer.signal(signal);
      }
    });

    // Handle user joined
    socketRef.current.on('user-joined', (data) => {
      if (!isRoomLocked) {
        createPeer(data.socketId, socketRef.current.id, stream);
        setUsers(prev => [...prev, data]);
        if (settings.notifications) {
          showNotification(`${data.userName} joined`);
        }
      }
    });

    // Handle current users
    socketRef.current.on('current-users', (currentUsers) => {
      currentUsers.forEach(user => {
        if (user.socketId !== socketRef.current.id) {
          createPeer(user.socketId, socketRef.current.id, stream);
        }
      });
      setUsers(currentUsers.filter(u => u.socketId !== socketRef.current.id));
    });

    // Handle user left
    socketRef.current.on('user-left', ({ socketId }) => {
      const peer = peersRef.current.find(p => p.peerID === socketId);
      if (peer) {
        peer.peer.destroy();
        peersRef.current = peersRef.current.filter(p => p.peerID !== socketId);
      }
      setPeers(prev => prev.filter(p => p.peerID !== socketId));
      setUsers(prev => prev.filter(u => u.socketId !== socketId));
    });

    // Handle chat messages
    socketRef.current.on('receive-message', (data) => {
      setMessages(prev => [...prev, { ...data, isOwn: false }]);
    });

    // Handle raise hand
    socketRef.current.on('hand-raised', (data) => {
      setRaisedUsers(prev => [...prev, data.userName]);
    });

    socketRef.current.on('hand-lowered', (data) => {
      setRaisedUsers(prev => prev.filter(u => u !== data.userName));
    });

    // Handle recording status
    socketRef.current.on('recording-started', (data) => {
      showNotification('Recording started');
    });

    return () => {
      socketRef.current.disconnect();
      stream?.getTracks().forEach(track => track.stop());
      screenStream?.getTracks().forEach(track => track.stop());
      clearInterval(meetingTimer);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRoomLocked, settings]);

  const getResolution = (quality) => {
    const resolutions = {
      low: { width: 360, height: 270 },
      medium: { width: 480, height: 360 },
      high: { width: 720, height: 540 },
      ultra: { width: 1080, height: 810 }
    };
    return resolutions[quality] || resolutions.medium;
  };

  const showNotification = (message) => {
    if (Notification.permission === 'granted') {
      new Notification('Video Conference', { body: message });
    }
  };

  const startRecording = () => {
    if (!stream) return;

    const options = { mimeType: 'video/webm' };
    mediaRecorderRef.current = new MediaRecorder(stream, options);
    recordedChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      recordedChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meeting-${Date.now()}.webm`;
      link.click();
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    socketRef.current.emit('recording-started', { userName: userName.current });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingDuration(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const raiseHand = () => {
    setIsHandRaised(!isHandRaised);
    socketRef.current.emit(isHandRaised ? 'hand-lowered' : 'hand-raised', {
      userName: userName.current
    });
  };

  const toggleRoomLock = () => {
    if (isAdmin) {
      setIsRoomLocked(!isRoomLocked);
      socketRef.current.emit('room-locked', { locked: !isRoomLocked });
    }
  };

  const muteAll = () => {
    if (isAdmin) {
      socketRef.current.emit('mute-all', { byUser: userName.current });
    }
  };

  const removeUser = (socketId) => {
    if (isAdmin) {
      socketRef.current.emit('remove-user', { socketId });
    }
  };

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleSpeakerView = (peerId) => {
    if (viewMode === 'speaker' && speakerPeerId === peerId) {
      setViewMode('gallery');
      setSpeakerPeerId(null);
    } else {
      setViewMode('speaker');
      setSpeakerPeerId(peerId);
    }
  };

  const createPeer = (peerSocketId, creatorId, stream) => {
    const peer = new SimplePeer({
      initiator: true,
      trickleIce: true,
      stream: stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    peer.on('signal', signal => {
      socketRef.current.emit('signal', { to: peerSocketId, signal });
    });

    peer.on('stream', remoteStream => {
      const existingPeer = peersRef.current.find(p => p.peerID === peerSocketId);
      if (!existingPeer) {
        peersRef.current.push({
          peerID: peerSocketId,
          peer,
          stream: remoteStream
        });
        setPeers(prev => [...prev, { peerID: peerSocketId, stream: remoteStream }]);
      }
    });

    peer.on('error', error => {
      console.error('Peer error:', error);
    });

    return peer;
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
      setScreenStream(screenStream);
      setIsScreenSharing(true);

      socketRef.current.emit('screen-share-started', {
        userName: userName.current,
        timestamp: new Date().toISOString()
      });

      screenStream.getTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
      if (error.name !== 'NotAllowedError') {
        alert('Unable to share screen');
      }
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);

      socketRef.current.emit('screen-share-stopped', {
        userName: userName.current
      });
    }
  };

  const toggleMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleSendMessage = (message) => {
    const fullMessage = {
      ...message,
      isOwn: true
    };
    setMessages(prev => [...prev, fullMessage]);

    socketRef.current.emit('send-message', {
      text: message.text,
      userName: message.userName,
      timestamp: message.timestamp
    });
  };

  return (
    <div className="video-room-container">
      <div className="header">
        <div className="header-content">
          <h1>🎥 Pro Video Conference</h1>
          <span className="participants-badge">👥 {users.length + 1} | ⏱️ {Math.floor(meetingDuration / 60)}m</span>
        </div>
        <div className="header-actions">
          <MeetingCode code={meetingCode} />
          <button
            className={`header-btn ${showParticipants ? 'active' : ''}`}
            onClick={() => setShowParticipants(!showParticipants)}
          >
            👥
          </button>
          <button className="header-btn" onClick={() => setShowSettings(true)}>
            ⚙️
          </button>
          <button className="header-btn" onClick={() => setShowAnalytics(true)}>
            📊
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className={`side-panel ${showParticipants ? 'visible' : ''}`}>
          <ParticipantsList
            users={users}
            currentUser={{ userName: userName.current, socketId: 'self' }}
            onRemoveUser={removeUser}
            isAdmin={isAdmin}
          />
          {isAdmin && <AdminPanel isAdmin={isAdmin} onMuteAll={muteAll} onLockRoom={toggleRoomLock} isRoomLocked={isRoomLocked} />}
          <RaiseHand isRaised={isHandRaised} onToggle={raiseHand} raisedUsers={raisedUsers} />
          <MeetingTimer duration={meetingDuration} />
          {isRecording && <MeetingRecorder isRecording={isRecording} onToggleRecord={() => { isRecording ? stopRecording() : startRecording(); }} duration={recordingDuration} />}
        </div>

        <div className="video-section">
          {isScreenSharing && screenStream ? (
            <div className="screen-share-container">
              <div className="screen-header">
                <span>📺 Screen Sharing - {userName.current}</span>
                <button className="stop-share-btn" onClick={stopScreenShare}>
                  Stop Sharing
                </button>
              </div>
              <video ref={screenVideo} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ) : viewMode === 'speaker' && speakerPeerId ? (
            <div className="speaker-view">
              <div className="speaker-video-large">
                {peers.find(p => p.peerID === speakerPeerId) && (
                  <VideoFrame stream={peers.find(p => p.peerID === speakerPeerId).stream} userName={`User-${speakerPeerId.substr(0, 5)}`} />
                )}
              </div>
              <div className="speaker-thumbnails">
                <div className="thumbnail">
                  <video playsInline muted ref={userVideo} autoPlay className={isVideoOff ? 'video-off' : ''} />
                  <span className="thumb-name">{userName.current}</span>
                </div>
                {peers.map(peer => (
                  <div key={peer.peerID} className="thumbnail">
                    <VideoFrame stream={peer.stream} userName={`User-${peer.peerID.substr(0, 5)}`} />
                    <span className="thumb-name">User-{peer.peerID.substr(0, 5)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="videos-grid">
              <div className="video-item local-video" onClick={() => toggleSpeakerView('self')}>
                <video playsInline muted ref={userVideo} autoPlay className={isVideoOff ? 'video-off' : ''} />
                <div className="video-info">
                  <span className="video-name">{userName.current} (You)</span>
                  <div className="video-indicators">
                    {isMuted && <span className="indicator">🔇 Muted</span>}
                    {isVideoOff && <span className="indicator">📹 Off</span>}
                  </div>
                </div>
              </div>
              {peers.map(peer => (
                <div key={peer.peerID} className="video-item" onClick={() => toggleSpeakerView(peer.peerID)}>
                  <VideoFrame stream={peer.stream} userName={`User-${peer.peerID.substr(0, 5)}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {showChat && (
          <div className="chat-section">
            <ChatBox messages={messages} onSendMessage={handleSendMessage} userName={userName.current} />
            <FileSharing onFileSelect={(file) => console.log('File selected:', file)} messages={messages} />
          </div>
        )}
      </div>

      <div className="controls-bar">
        <div className="controls-group">
          <button className={`control-btn ${isMuted ? 'disabled' : ''}`} onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? '🔇' : '🎙️'}
          </button>
          <button className={`control-btn ${isVideoOff ? 'disabled' : ''}`} onClick={toggleVideo} title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}>
            {isVideoOff ? '📹' : '📷'}
          </button>
          <button className={`control-btn ${isScreenSharing ? 'active' : ''}`} onClick={isScreenSharing ? stopScreenShare : startScreenShare} title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
            📺
          </button>
          <BackgroundBlur isEnabled={isBackgroundBlurred} onToggle={() => setIsBackgroundBlurred(!isBackgroundBlurred)} />
          <button className="control-btn" onClick={() => setIsWhiteboardOpen(true)} title="Open whiteboard">
            ✏️
          </button>
          <button className={`control-btn ${isRecording ? 'recording' : ''}`} onClick={isRecording ? stopRecording : startRecording} title={isRecording ? 'Stop recording' : 'Start recording'}>
            {isRecording ? '⏹' : '⏺'}
          </button>
          <button className={`control-btn ${showChat ? 'active' : ''}`} onClick={() => setShowChat(!showChat)} title="Toggle chat">
            💬
          </button>
          <button className={`control-btn ${viewMode === 'speaker' ? 'active' : ''}`} onClick={() => setViewMode(viewMode === 'speaker' ? 'gallery' : 'speaker')} title="Toggle speaker view">
            👨‍💼
          </button>
          <button className="control-btn" onClick={() => setShowTranscript(true)} title="Show transcript">
            📝
          </button>
          <button className="control-btn end-call" onClick={() => window.location.reload()} title="End call">
            📞
          </button>
        </div>
      </div>

      <Whiteboard isOpen={isWhiteboardOpen} onClose={() => setIsWhiteboardOpen(false)} />
      <MeetingAnalytics isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} stats={{ participantsJoined: users.length + 1, totalDuration: meetingDuration, messagesCount: messages.length }} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} onSettingsChange={handleSettingsChange} />
      <Transcription isOpen={showTranscript} onClose={() => setShowTranscript(false)} transcript={transcript} />
    </div>
  );
};

const VideoFrame = ({ stream, userName }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <video playsInline ref={videoRef} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

export default VideoRoom;
