import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import './VideoRoom.css';

const VideoRoom = () => {
  const socketRef = useRef();
  const peersRef = useRef([]);
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState();
  const [users, setUsers] = useState([]);
  const userVideo = useRef();
  const userName = useRef();

  useEffect(() => {
    // Get user media (camera/microphone)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setStream(stream);
        userVideo.current.srcObject = stream;
      })
      .catch(error => console.error('Error accessing media devices:', error));

    // Initialize socket
    const SOCKET_SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_SERVER);
    userName.current = `User-${Math.random().toString(36).substr(2, 9)}`;

    socketRef.current.emit('user-join', {
      userId: socketRef.current.id,
      userName: userName.current
    });

    // Handle incoming signal
    socketRef.current.on('signal', ({ from, signal }) => {
      const peerConnection = peersRef.current.find(p => p.peerID === from);
      if (peerConnection) {
        peerConnection.peer.signal(signal);
      }
    });

    // Handle user joined
    socketRef.current.on('user-joined', (data) => {
      createPeer(data.socketId, socketRef.current.id, stream);
      setUsers(prev => [...prev, data]);
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

    return () => {
      socketRef.current.disconnect();
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

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

  return (
    <div className="video-room-container">
      <h1>Real-Time Video Conference</h1>

      <div className="videos-grid">
        <div className="video-item">
          <video
            playsInline
            muted
            ref={userVideo}
            autoPlay
            style={{ width: '100%', borderRadius: '8px' }}
          />
          <p>{userName.current} (You)</p>
        </div>

        {peers.map((peer) => (
          <VideoFrame key={peer.peerID} stream={peer.stream} />
        ))}
      </div>

      <div className="users-list">
        <h3>Connected Users: {users.length + 1}</h3>
        <ul>
          <li>{userName.current} (You)</li>
          {users.map(user => (
            <li key={user.socketId}>{user.userName}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const VideoFrame = ({ stream }) => {
  const videoRef = useRef();

  useEffect(() => {
    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="video-item">
      <video
        playsInline
        autoPlay
        ref={videoRef}
        style={{ width: '100%', borderRadius: '8px' }}
      />
    </div>
  );
};

export default VideoRoom;
