/**
 * pages/MessagesPage.jsx
 * Real-time chat inbox and conversation view using Socket.io.
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';
import socketService from '../services/socket';
import { useAuth } from '../context/AuthContext';

export default function MessagesPage() {
  const { userId: chatPartnerId } = useParams(); // Set when navigating to a specific chat
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [text, setText] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch inbox
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const { data } = await api.get('/messages/inbox');
        setConversations(data.data);
      } catch {
        toast.error('Failed to load inbox.');
      } finally {
        setLoadingConvos(false);
      }
    };
    fetchInbox();
  }, []);

  // Load conversation when chatPartnerId changes (from URL)
  useEffect(() => {
    if (!chatPartnerId) return;
    loadConversation(chatPartnerId);
  }, [chatPartnerId]);

  const loadConversation = async (partnerId) => {
    try {
      // Load partner info
      const { data: profileData } = await api.get(`/users/${partnerId}`);
      setActivePartner(profileData.data.user);

      const { data } = await api.get(`/messages/${partnerId}`);
      setMessages(data.data);
    } catch {
      toast.error('Failed to load conversation.');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for incoming messages via Socket.io
  useEffect(() => {
    const cleanup = socketService.onMessage((msg) => {
      if (
        (msg.sender._id === activePartner?._id && msg.receiver._id === user._id) ||
        (msg.sender._id === user._id && msg.receiver._id === activePartner?._id)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return cleanup;
  }, [activePartner, user]);

  const handleSend = async () => {
    if (!text.trim() || !activePartner) return;
    const msgText = text;
    setText('');

    try {
      const { data } = await api.post('/messages', { receiverId: activePartner._id, text: msgText });
      setMessages(prev => [...prev, data.data]);
    } catch {
      toast.error('Failed to send message.');
      setText(msgText); // Restore text on failure
    }
  };

  return (
    <div className="flex h-screen bg-black">
      {/* ── Conversations List ── */}
      <div className={`w-full md:w-80 border-r border-zinc-800 flex flex-col ${chatPartnerId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-zinc-800">
          <h2 className="font-bold text-lg">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-sm">
              <p className="text-2xl mb-2">💬</p>
              <p>No conversations yet</p>
              <p className="mt-1">Message sellers from their posts</p>
            </div>
          ) : (
            conversations.map(convo => (
              <button
                key={convo._id?._id}
                onClick={() => loadConversation(convo._id?._id)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition-colors text-left
                  ${activePartner?._id === convo._id?._id ? 'bg-zinc-900' : ''}`}
              >
                {convo._id?.profilePhoto ? (
                  <img src={convo._id.profilePhoto} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center font-bold flex-shrink-0">
                    {convo._id?.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">@{convo._id?.username}</p>
                  <p className="text-xs text-zinc-500 truncate">
                    {convo.lastMessage?.text?.slice(0, 40)}...
                  </p>
                </div>
                {convo.unreadCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {convo.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div className={`flex-1 flex flex-col ${!chatPartnerId && !activePartner ? 'hidden md:flex' : 'flex'}`}>
        {!activePartner ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p>Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
              <Link to={`/profile/${activePartner._id}`}>
                {activePartner.profilePhoto ? (
                  <img src={activePartner.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm">
                    {activePartner.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </Link>
              <div>
                <p className="font-semibold text-sm">@{activePartner.username}</p>
                <p className="text-xs text-zinc-500 capitalize">{activePartner.role}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, i) => {
                const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                return (
                  <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm
                      ${isMine
                        ? 'bg-orange-500 text-white rounded-br-sm'
                        : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-orange-200' : 'text-zinc-500'}`}>
                        {formatDistanceToNow(new Date(msg.createdAt || Date.now()), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-800 flex gap-2">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-800 rounded-full px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
