import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { IoMdHappy, IoMdSend } from 'react-icons/io';
import { BsReplyFill } from 'react-icons/bs';

const MessagesPage = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const scrollRef = useRef();

  // 1. Fetch Conversations
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages/${userId}`);
        setMessages(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [userId]);

  // 2. Handle Sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post('/api/messages', {
        receiverId: userId,
        text: newMessage,
        replyTo: replyTo ? replyTo._id : null
      });
      setMessages([...messages, res.data.data]);
      setNewMessage("");
      setReplyTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Handle Reactions
  const handleReaction = async (messageId, emoji) => {
    try {
      const res = await axios.post(`/api/messages/react/${messageId}`, { emoji });
      setMessages(messages.map(m => m._id === messageId ? res.data.data : m));
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Loading Safety Check
  if (!messages) {
    return <div className="flex h-screen items-center justify-center bg-white text-black">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="p-4 bg-white border-b flex justify-between items-center">
        <h2 className="font-bold text-lg">Chat</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm text-center mt-2">Start the conversation by sending a message below!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`flex ${msg.sender === userId ? 'justify-start' : 'justify-end'}`}>
              <div className={`relative max-w-[70%] p-3 rounded-2xl shadow-sm ${
                msg.sender === userId ? 'bg-white text-gray-800' : 'bg-blue-600 text-white'
              }`}>
                
                {/* Show Reply Preview if this message is a reply */}
                {msg.replyTo && (
                  <div className="bg-black/10 p-2 mb-2 rounded text-xs italic border-l-4 border-blue-300">
                    Replying to: {msg.replyTo.text.substring(0, 30)}...
                  </div>
                )}

                <p>{msg.text}</p>

                {/* Interaction Buttons */}
                <div className="flex gap-2 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                  <button onClick={() => setReplyTo(msg)} className="text-xs flex items-center gap-1">
                    <BsReplyFill /> Reply
                  </button>
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-xs">
                    <IoMdHappy />
                  </button>
                </div>

                {/* Reactions Display */}
                {msg.reactions?.length > 0 && (
                  <div className="absolute -bottom-2 right-2 flex bg-white rounded-full px-1 shadow-sm border text-sm">
                    {msg.reactions.map((r, i) => <span key={i}>{r.emoji}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        {replyTo && (
          <div className="flex justify-between items-center bg-gray-100 p-2 mb-2 rounded-lg border-l-4 border-blue-500">
            <span className="text-sm text-gray-600">Replying to: <b>{replyTo.text}</b></span>
            <button onClick={() => setReplyTo(null)} className="text-red-500 text-xs">Cancel</button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-2xl text-gray-500">
            <IoMdHappy />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-14 left-0 z-50">
              <EmojiPicker onEmojiClick={(emojiData) => {
                setNewMessage(prev => prev + emojiData.emoji);
                setShowEmojiPicker(false); // Closes picker automatically after clicking an emoji!
              }} />
            </div>
          )}

          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 bg-gray-100 rounded-full outline-none px-4"
          />
          <button type="submit" className="text-blue-600 text-2xl">
            <IoMdSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagesPage;