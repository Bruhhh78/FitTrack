import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiSend, FiX, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Chat = ({ batchId, receiverId, isAdmin = false, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    setSocket(newSocket);

    const roomId = [user._id, receiverId, batchId].sort().join('_');
    newSocket.emit('join_room', roomId);

    api.get(`/chat/history/${receiverId}/${batchId}`)
      .then(r => setMessages(r.data.messages))
      .catch(err => {
        if (err.response?.status === 403) {
           // Chat is locked
        }
      });

    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => newSocket.close();
  }, [batchId, receiverId, user._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      senderId: user._id,
      receiverId,
      batchId,
      text: newMessage,
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiMessageSquare />
          <h4 style={{ margin: 0, fontWeight: 700 }}>{isAdmin ? 'Chat with User' : 'Support Chat'}</h4>
        </div>
        {onClose && <button className="btn-icon" onClick={onClose}><FiX /></button>}
      </div>
      
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.senderId === user._id ? 'sent' : 'received'}`}>
            <div className="bubble-text">{m.text}</div>
            <div className="bubble-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form className="chat-input" onSubmit={sendMessage}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)}
        />
        <button type="submit" className="btn-send"><FiSend /></button>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        .chat-window {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          height: 450px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }
        .chat-header {
          padding: 12px 16px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .chat-bubble {
          max-width: 80%;
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 0.9rem;
          position: relative;
        }
        .chat-bubble.sent {
          align-self: flex-end;
          background: var(--accent);
          color: #fff;
          border-bottom-right-radius: 2px;
        }
        .chat-bubble.received {
          align-self: flex-start;
          background: var(--bg-tertiary);
          border-bottom-left-radius: 2px;
        }
        .bubble-time {
          font-size: 0.65rem;
          opacity: 0.7;
          margin-top: 4px;
          text-align: right;
        }
        .chat-input {
          padding: 12px;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 8px;
        }
        .chat-input input {
          flex: 1;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 8px 16px;
          color: var(--text-main);
          outline: none;
        }
        .btn-send {
          background: var(--accent);
          color: #fff;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
      `}} />
    </div>
  );
};

export default Chat;
