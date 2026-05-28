import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Hash, 
  Send, 
  Users, 
  ShieldAlert, 
  Sparkles,
  MessageSquare
} from 'lucide-react';

const Chat = () => {
  const { token, user } = useAuth();
  const socket = useSocket();

  const [channels] = useState([
    { id: 'general', label: 'general', desc: 'Global announcement and team discussions' },
    { id: 'impressa', label: 'kuri-macye', desc: 'Kuri Macye e-commerce tracking & support sync' },
    { id: 'gesture-to-speech', label: 'gesture-to-speech', desc: 'Rwandan sign language translator development' },
    { id: 'linker', label: 'linker', desc: 'Smart ticket booking operations & support' },
    { id: 'homland', label: 'homland', desc: 'Homland rental portal verification discussions' }
  ]);

  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch messages when switching channels
  const fetchMessages = async (channelId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/messages/channel/${channelId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      // Handle fetch messages error silently or show inline indicator
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(activeChannel);
  }, [token, activeChannel]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket Live Chat Listener
  useEffect(() => {
    if (!socket) return;

    // Join the current channel's chat room
    socket.emit('join_channel', activeChannel);

    // Listen for incoming messages
    socket.on('receive_message', (message) => {
      if (message.channel === activeChannel) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket, activeChannel]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const messageContent = typedMessage;
    setTypedMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: messageContent,
          channel: activeChannel
        })
      });

      if (response.ok) {
        const message = await response.json();
        
        // Append locally if database is not using live sync to trigger list
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });

        // Broadcast to WebSocket room
        if (socket) {
          socket.emit('send_message', message);
        }
      }
    } catch (err) {
      // Handle send message error silently or show error banner
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex overflow-hidden max-w-7xl mx-auto border border-slate-800 rounded-2xl bg-slate-900 shadow-2xl">
      
      {/* Channels List Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-slate-900 shrink-0">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            Communication Hub
          </h2>
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider block mt-0.5 uppercase">Replacing Whatsapp/Slack</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          <div className="text-[9px] font-bold text-slate-500 px-3 uppercase tracking-wider mb-2">Channels</div>
          {channels.map((chan) => {
            const isActive = activeChannel === chan.id;
            return (
              <button
                key={chan.id}
                onClick={() => setActiveChannel(chan.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{chan.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Pane */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-900">
        
        {/* Channel Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 shrink-0 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-purple-400" />
              {channels.find(c => c.id === activeChannel)?.label}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              {channels.find(c => c.id === activeChannel)?.desc}
            </p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            Active Channel
          </div>
        </div>

        {/* Message History Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 p-6">
              <div className="w-12 h-12 rounded-full bg-slate-850 flex items-center justify-center text-slate-650">
                <Hash className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-300">Welcome to #{activeChannel}!</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">This is the start of the #{activeChannel} channel history. Send a message to start conversing with the team.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3.5 group">
                <img 
                  src={msg.sender?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                  alt={msg.sender?.name} 
                  className="w-9 h-9 rounded-xl bg-slate-950 p-0.5 border border-slate-800 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-xs font-bold text-slate-200">{msg.sender?.name || 'Ubaka Member'}</span>
                    <span className="text-[9px] text-slate-500 font-semibold">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl bg-slate-950/40 border border-slate-850 px-3 py-2 rounded-xl rounded-tl-none">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder={`Send a message to #${activeChannel}...`}
              className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!typedMessage.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white p-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/10 cursor-pointer shrink-0 active:scale-95"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Chat;
