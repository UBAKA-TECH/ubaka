import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { encryptMessage, decryptMessage } from '../utils/crypto';
import { 
  Hash, 
  Send, 
  Users, 
  ShieldAlert, 
  Sparkles,
  MessageSquare,
  Search,
  Plus,
  Lock,
  Unlock,
  Check,
  CheckCheck,
  Loader2,
  X,
  Shield,
  Eye
} from 'lucide-react';

const Chat = () => {
  const { token, user } = useAuth();
  const socket = useSocket();

  // Rooms and Messages State
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [decryptedMessages, setDecryptedMessages] = useState({});
  const [typedMessage, setTypedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Contacts and Search State
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Room Decryption Key State
  const [roomKeys, setRoomKeys] = useState({}); // Stores key per roomId to trigger re-renders
  const [unlockPassphrase, setUnlockPassphrase] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Group Creation State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isE2EEToggled, setIsE2EEToggled] = useState(false);
  const [groupPassphrase, setGroupPassphrase] = useState('');
  const [groupCreationError, setGroupCreationError] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Typing state
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

  const messagesEndRef = useRef(null);

  // Derived properties
  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const isHROrAdmin = user?.role === 'sysadmin' || user?.role === 'hr_manager' || user?.permissions?.includes('manage_hr');

  // Fetch all chat rooms
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/messages/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
        // Set first room as active if none is set
        if (data.length > 0 && !activeRoomId) {
          setActiveRoomId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all employees for contact search & group creation
  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter out current user from contacts to DM or add to group
        setContacts(data.filter(c => c.id !== user?.id));
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Fetch messages for a specific room
  const fetchMessages = async (roomId) => {
    setMessagesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/messages/rooms/${roomId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);

        // Mark messages as read in DB
        await fetch(`${API_BASE_URL}/messages/rooms/${roomId}/read`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Update local room unread count to 0
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, unreadCount: 0 } : r));

        // Notify socket peers that we read messages
        if (socket) {
          socket.emit('mark_read', {
            roomId,
            employeeId: user.id,
            messageIds: data.map(m => m.id)
          });
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    if (token && user?.id) {
      fetchRooms();
      fetchContacts();
    }
  }, [token, user?.id]);

  // Handle active room switch
  useEffect(() => {
    if (activeRoomId) {
      fetchMessages(activeRoomId);
      setTypingUser(null);
    }
  }, [activeRoomId]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, decryptedMessages, typingUser]);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      const filtered = contacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchQuery, contacts]);

  // Handle decryption of messages when list or key changes
  useEffect(() => {
    const decryptAll = async () => {
      if (!activeRoomId) return;
      const key = sessionStorage.getItem('room_key_' + activeRoomId);
      const decMap = {};

      for (const msg of messages) {
        if (msg.content.startsWith('[E2EE-AES-GCM]:')) {
          if (key) {
            const dec = await decryptMessage(msg.content, key);
            decMap[msg.id] = dec;
          } else {
            decMap[msg.id] = "🔒 [Encrypted Message - Unlock Chat to view]";
          }
        } else {
          decMap[msg.id] = msg.content;
        }
      }
      setDecryptedMessages(decMap);
    };

    decryptAll();
  }, [messages, activeRoomId, roomKeys]);

  // WebSocket event bindings
  useEffect(() => {
    if (!socket || !user) return;

    // Join user room for direct room creations/notifications
    socket.emit('join_user', user.id);

    // Join the current room channel
    if (activeRoomId) {
      socket.emit('join_channel', activeRoomId);
    }

    // Handle new message received
    socket.on('receive_message', async (message) => {
      if (message.roomId === activeRoomId) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });

        // Mark it as read in database
        await fetch(`${API_BASE_URL}/messages/rooms/${activeRoomId}/read`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Notify socket peers that we read it
        socket.emit('mark_read', {
          roomId: activeRoomId,
          employeeId: user.id,
          messageIds: [message.id]
        });
      } else {
        // Increment unread count for other rooms
        setRooms(prev => prev.map(r => {
          if (r.id === message.roomId) {
            return {
              ...r,
              unreadCount: r.unreadCount + 1,
              lastMessage: {
                id: message.id,
                content: message.content,
                createdAt: message.createdAt,
                senderName: message.sender.name,
                senderId: message.senderId
              }
            };
          }
          return r;
        }));
      }
    });

    // Handle room read indicators in real time
    socket.on('messages_read', (data) => {
      if (data.roomId === activeRoomId) {
        setMessages(prev => prev.map(msg => {
          if (data.messageIds.includes(msg.id)) {
            // Avoid adding duplicate read receipts
            const alreadyExists = msg.readReceipts.some(r => r.employeeId === data.employeeId);
            if (!alreadyExists) {
              return {
                ...msg,
                readReceipts: [
                  ...msg.readReceipts,
                  {
                    employeeId: data.employeeId,
                    readAt: data.readAt,
                    employee: { name: contacts.find(c => c.id === data.employeeId)?.name || 'Member' }
                  }
                ]
              };
            }
          }
          return msg;
        }));
      }
    });

    // Handle typing indicators in real time
    socket.on('user_typing', (data) => {
      if (data.roomId === activeRoomId) {
        if (data.isTyping) {
          setTypingUser(data.name);
        } else {
          setTypingUser(null);
        }
      }
    });

    // Handle background room creation
    socket.on('room_created', (newRoom) => {
      setRooms(prev => {
        if (prev.some(r => r.id === newRoom.id)) return prev;
        return [newRoom, ...prev];
      });
    });

    return () => {
      socket.off('receive_message');
      socket.off('messages_read');
      socket.off('user_typing');
      socket.off('room_created');
    };
  }, [socket, activeRoomId, user, contacts]);

  // Initiate direct chat (DM)
  const handleStartDM = async (contact) => {
    setSearchQuery('');
    setSearchResults([]);
    try {
      const response = await fetch(`${API_BASE_URL}/messages/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isGroup: false,
          memberIds: [contact.id]
        })
      });

      if (response.ok) {
        const room = await response.json();
        setRooms(prev => {
          if (prev.some(r => r.id === room.id)) return prev;
          return [room, ...prev];
        });
        setActiveRoomId(room.id);
      }
    } catch (err) {
      console.error("Error creating DM room:", err);
    }
  };

  // Group creation handler
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setGroupCreationError("Group name is required");
      return;
    }
    if (selectedMemberIds.length === 0) {
      setGroupCreationError("Please select at least one group member");
      return;
    }
    if (isE2EEToggled && !groupPassphrase.trim()) {
      setGroupCreationError("A secure passphrase is required for end-to-end encryption");
      return;
    }

    setCreatingGroup(true);
    setGroupCreationError('');

    try {
      let encryptionValidation = null;
      if (isE2EEToggled) {
        // Client-side E2EE validation string setup
        encryptionValidation = await encryptMessage("valid", groupPassphrase);
      }

      const response = await fetch(`${API_BASE_URL}/messages/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isGroup: true,
          name: groupName,
          isEncrypted: isE2EEToggled,
          encryptionValidation,
          memberIds: selectedMemberIds
        })
      });

      if (response.ok) {
        const room = await response.json();
        
        // Save passphrase locally in sessionStorage immediately
        if (isE2EEToggled) {
          sessionStorage.setItem('room_key_' + room.id, groupPassphrase);
          setRoomKeys(prev => ({ ...prev, [room.id]: groupPassphrase }));
        }

        setRooms(prev => [room, ...prev]);
        setActiveRoomId(room.id);
        
        // Reset modal form
        setGroupName('');
        setSelectedMemberIds([]);
        setIsE2EEToggled(false);
        setGroupPassphrase('');
        setIsGroupModalOpen(false);
      } else {
        const errorData = await response.json();
        setGroupCreationError(errorData.error || "Failed to create group");
      }
    } catch (err) {
      setGroupCreationError("Server communication failed");
    } finally {
      setCreatingGroup(false);
    }
  };

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeRoomId) return;

    const rawContent = typedMessage;
    setTypedMessage('');

    // Emit stop typing
    if (socket) {
      socket.emit('typing', { roomId: activeRoomId, employeeId: user.id, name: user.name, isTyping: false });
    }

    try {
      let finalContent = rawContent;
      if (activeRoom.isEncrypted) {
        const key = sessionStorage.getItem('room_key_' + activeRoomId);
        if (!key) {
          alert("Cannot send message: Chat room is locked.");
          return;
        }
        finalContent = await encryptMessage(rawContent, key);
      }

      const response = await fetch(`${API_BASE_URL}/messages/rooms/${activeRoomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: finalContent })
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });

        // Trigger socket emit
        if (socket) {
          socket.emit('send_message', message);
        }

        // Update rooms listing's last message
        setRooms(prev => prev.map(r => {
          if (r.id === activeRoomId) {
            return {
              ...r,
              lastMessage: {
                id: message.id,
                content: message.content,
                createdAt: message.createdAt,
                senderName: user.name,
                senderId: user.id
              }
            };
          }
          return r;
        }));
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Typing emit trigger
  const handleTypingInput = (e) => {
    setTypedMessage(e.target.value);
    if (!socket || !activeRoomId) return;

    // Send typing event
    socket.emit('typing', {
      roomId: activeRoomId,
      employeeId: user.id,
      name: user.name,
      isTyping: true
    });

    // Clear timeout and reset
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        roomId: activeRoomId,
        employeeId: user.id,
        name: user.name,
        isTyping: false
      });
    }, 1500);
  };

  // E2EE Decrypt Room Unlock handler
  const handleUnlockRoom = async (e) => {
    e.preventDefault();
    if (!unlockPassphrase.trim()) return;

    setUnlockError('');
    try {
      const dec = await decryptMessage(activeRoom.encryptionValidation, unlockPassphrase);
      if (dec === "valid") {
        // Success
        sessionStorage.setItem('room_key_' + activeRoomId, unlockPassphrase);
        setRoomKeys(prev => ({ ...prev, [activeRoomId]: unlockPassphrase }));
        setUnlockPassphrase('');
      } else {
        setUnlockError("Incorrect passphrase. Decryption failed.");
      }
    } catch (err) {
      setUnlockError("Decryption error.");
    }
  };

  // Checkbox select helper for members list
  const toggleMemberSelection = (id) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  // Check if room is locked
  const isRoomLocked = activeRoom?.isEncrypted && !sessionStorage.getItem('room_key_' + activeRoomId);

  return (
    <div className="h-[calc(100vh-2rem)] flex overflow-hidden max-w-7xl mx-auto border border-slate-800 rounded-2xl bg-slate-900 shadow-2xl relative">
      
      {/* Sidebar (Rooms & Search) */}
      <div className="w-80 border-r border-slate-800 bg-slate-950 flex flex-col min-h-0 overflow-hidden">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-900 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-purple-400" />
              Ubaka Chat
            </h2>
            
            {/* Create Group Button (restricted to HR & Admin) */}
            {isHROrAdmin && (
              <button 
                onClick={() => setIsGroupModalOpen(true)}
                className="p-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/25 border border-purple-500/25 text-purple-400 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                title="Create Group Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Search Contacts Bar */}
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-slate-650 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="Search employee contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Room/Contacts Scroll List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          
          {/* Rendering Contacts Search Results */}
          {searchQuery ? (
            <>
              <div className="text-[9px] font-bold text-purple-400 px-3 uppercase tracking-wider mb-2">Search Results ({searchResults.length})</div>
              {searchResults.length === 0 ? (
                <div className="text-center py-6 text-slate-600 text-xs">No employees match "{searchQuery}"</div>
              ) : (
                searchResults.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => handleStartDM(contact)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900/50 transition-all cursor-pointer border border-transparent hover:border-slate-800 text-left"
                  >
                    <img 
                      src={contact.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                      alt={contact.name} 
                      className="w-8.5 h-8.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">{contact.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{contact.title || contact.roleName}</div>
                    </div>
                  </button>
                ))
              )}
            </>
          ) : (
            /* Rendering Active Chat Rooms & Company Directory */
            <>
              <div className="text-[9px] font-bold text-slate-500 px-3 uppercase tracking-wider mb-2">Active Conversations</div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-6 px-4">
                  <div className="text-xs text-slate-650">No active chats. Start one below.</div>
                </div>
              ) : (
                rooms.map((room) => {
                  const isActive = activeRoomId === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer border text-left ${
                        isActive 
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {room.isGroup ? (
                          <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/35 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-400" />
                          </div>
                        ) : (
                          <img 
                            src={room.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                            alt={room.name} 
                            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800"
                          />
                        )}
                        {room.isEncrypted && (
                          <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-600 rounded-full border-2 border-slate-950 flex items-center justify-center">
                            <Lock className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Room details */}
                      <div className="flex-1 overflow-hidden min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold truncate ${isActive ? 'text-purple-400' : 'text-slate-200'}`}>
                            {room.name}
                          </span>
                          {room.lastMessage && (
                            <span className="text-[9px] text-slate-500 shrink-0 font-medium ml-1">
                              {new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] text-slate-500 truncate pr-2">
                            {room.isEncrypted ? (
                              <span className="flex items-center gap-0.5 text-emerald-500 font-semibold">
                                <Lock className="w-2.5 h-2.5" /> E2EE Encrypted
                              </span>
                            ) : room.lastMessage ? (
                              `${room.lastMessage.senderName}: ${
                                room.lastMessage.content.startsWith('[E2EE-AES-GCM]:') 
                                  ? '🔒 Message' 
                                  : room.lastMessage.content
                              }`
                            ) : (
                              'No messages yet'
                            )}
                          </span>
                          
                          {/* Unread badge count */}
                          {room.unreadCount > 0 && (
                            <span className="shrink-0 text-[10px] bg-purple-600 text-white rounded-full font-bold px-1.5 py-0.5 min-w-4 text-center animate-pulse">
                              {room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}

              {/* Company Directory Section */}
              <div className="text-[9px] font-bold text-slate-500 px-3 uppercase tracking-wider mt-5 mb-2 border-t border-slate-900/60 pt-4">Company Directory</div>
              {contacts.length === 0 ? (
                <div className="text-center py-4 text-slate-600 text-xs">No employees found.</div>
              ) : (
                contacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => handleStartDM(contact)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-slate-800/40 transition-all cursor-pointer text-left"
                  >
                    <img 
                      src={contact.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                      alt={contact.name} 
                      className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-850 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-200 truncate">{contact.name}</div>
                      <div className="text-[9px] text-slate-500 font-semibold uppercase truncate">{contact.title || contact.roleName}</div>
                    </div>
                  </button>
                ))
              )}
            </>
          )}

        </div>

        {/* User Card footer */}
        <div className="p-3 border-t border-slate-900 bg-slate-950/60 flex items-center gap-3 shrink-0">
          <img 
            src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
            alt={user?.name} 
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 p-0.5"
          />
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate">{user?.name}</div>
            <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{user?.roleName || 'Employee'}</div>
          </div>
        </div>

      </div>

      {/* Main Chat Pane */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900 relative">
        
        {activeRoomId ? (
          <>
            {/* Active Chat Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 shrink-0 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {activeRoom.isGroup ? (
                  <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/35 flex items-center justify-center shrink-0">
                    <Users className="w-4.5 h-4.5 text-purple-400" />
                  </div>
                ) : (
                  <img 
                    src={activeRoom.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                    alt={activeRoom.name} 
                    className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 shrink-0"
                  />
                )}
                
                <div>
                  <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                    {activeRoom.name}
                    {activeRoom.isEncrypted && (
                      <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                        <Lock className="w-2.5 h-2.5" /> Encrypted
                      </span>
                    )}
                  </h3>
                  
                  {/* Typing Indicator / Members list */}
                  <div className="h-3 flex items-center mt-0.5">
                    {typingUser ? (
                      <span className="text-[9px] text-purple-400 font-bold animate-pulse">
                        {typingUser} is typing...
                      </span>
                    ) : (
                      <p className="text-[9px] text-slate-500 font-medium truncate max-w-sm">
                        {activeRoom.isGroup 
                          ? `${activeRoom.members.length} members: ${activeRoom.members.map(m => m.name).join(', ')}`
                          : activeRoom.members.find(m => m.id !== user?.id)?.title || 'Direct Conversation'
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {activeRoom.isEncrypted && sessionStorage.getItem('room_key_' + activeRoomId) && (
                  <button 
                    onClick={() => {
                      sessionStorage.removeItem('room_key_' + activeRoomId);
                      setRoomKeys(prev => {
                        const next = { ...prev };
                        delete next[activeRoomId];
                        return next;
                      });
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-lg text-[9px] font-bold text-emerald-400 cursor-pointer active:scale-95"
                  >
                    <Unlock className="w-3 h-3" /> Lock Session
                  </button>
                )}
              </div>
            </div>

            {/* E2EE Lock Screen Overlay (Prompt for passcode) */}
            {isRoomLocked ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-905/95 backdrop-blur-md z-20">
                <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                  <Shield className="w-8 h-8" />
                </div>
                
                <h4 className="text-sm font-bold text-white mb-1">Unlock Encrypted Chat</h4>
                <p className="text-xs text-slate-500 text-center max-w-xs leading-relaxed mb-6">
                  This room is secured with end-to-end encryption. Enter the validation passphrase to unlock and decrypt messages.
                </p>

                <form onSubmit={handleUnlockRoom} className="w-full max-w-xs space-y-3">
                  <div className="space-y-1">
                    <input 
                      type="password"
                      placeholder="Enter chat key..."
                      value={unlockPassphrase}
                      onChange={(e) => setUnlockPassphrase(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                    {unlockError && <p className="text-[10px] text-red-400 font-bold ml-1">{unlockError}</p>}
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-95"
                  >
                    Unlock Chat Room
                  </button>
                </form>
              </div>
            ) : (
              /* Message Viewport */
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                {messagesLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 p-6">
                    <div className="w-12 h-12 rounded-full bg-slate-850 flex items-center justify-center text-slate-650">
                      <Hash className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-300">Start of Conversation</h4>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                      Say hello to start the chat history. All messages are loaded in real time.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwnMessage = msg.senderId === user?.id;
                    const contentPlain = decryptedMessages[msg.id] || msg.content;
                    const isMessageEncrypted = msg.content.startsWith('[E2EE-AES-GCM]:');
                    
                    // Read receipt calculation
                    // Number of receipts (which includes sender receipt) vs total members
                    const readCount = msg.readReceipts?.length || 0;
                    const isReadByAll = activeRoom.members.every(member => 
                      msg.readReceipts.some(receipt => receipt.employeeId === member.id)
                    );

                    return (
                      <div key={msg.id} className={`flex items-start gap-3.5 group ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                        
                        {/* Sender Avatar */}
                        {!isOwnMessage && (
                          <img 
                            src={msg.sender?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                            alt={msg.sender?.name} 
                            className="w-9 h-9 rounded-xl bg-slate-950 p-0.5 border border-slate-800 shrink-0"
                          />
                        )}

                        <div className={`space-y-1 ${isOwnMessage ? 'text-right' : ''}`}>
                          <div className={`flex items-baseline gap-2.5 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-bold text-slate-200">
                              {isOwnMessage ? 'You' : msg.sender?.name}
                            </span>
                            <span className="text-[9px] text-slate-500 font-semibold">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className={`flex items-end gap-1.5 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                            {/* Message content bubble */}
                            <div className={`text-xs leading-relaxed max-w-2xl px-3.5 py-2.5 rounded-2xl ${
                              isOwnMessage 
                                ? 'bg-purple-600/10 border border-purple-500/20 text-purple-200 rounded-tr-none' 
                                : 'bg-slate-950/40 border border-slate-850 text-slate-300 rounded-tl-none'
                            }`}>
                              {isMessageEncrypted && !contentPlain.startsWith('🔒') && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400 font-bold mb-1 opacity-70">
                                  <Lock className="w-2.5 h-2.5" /> Decrypted
                                </span>
                              )}
                              <p className={isMessageEncrypted && contentPlain.startsWith('🔒') ? 'text-slate-500 italic' : ''}>
                                {contentPlain}
                              </p>
                            </div>

                            {/* Read Receipt Checkmarks (only for own messages) */}
                            {isOwnMessage && (
                              <div className="relative group/tooltip pb-1 inline-flex shrink-0">
                                {isReadByAll ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-400 cursor-help" />
                                ) : readCount > 1 ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                                )}
                                
                                {/* Hover tooltip to view read receipts */}
                                <div className="absolute bottom-full right-0 mb-1 w-44 p-2 bg-slate-950 border border-slate-850 text-[9px] text-slate-400 rounded-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity z-30 shadow-2xl text-left leading-tight">
                                  <div className="font-bold text-slate-200 border-b border-slate-850 pb-1 mb-1">Message Receipts</div>
                                  <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {msg.readReceipts && msg.readReceipts.length > 0 ? (
                                      msg.readReceipts.map(receipt => (
                                        <div key={receipt.employeeId} className="flex justify-between">
                                          <span className="font-semibold truncate max-w-[90px]">{receipt.employee?.name}</span>
                                          <span className="text-emerald-500">Read</span>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-slate-650">No receipt data</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Message Input Box */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={typedMessage}
                  onChange={handleTypingInput}
                  disabled={isRoomLocked}
                  placeholder={
                    isRoomLocked 
                      ? '🔒 Locked - Unlock chat room first' 
                      : `Send a message to ${activeRoom.name}...`
                  }
                  className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-30"
                />
                <button
                  type="submit"
                  disabled={!typedMessage.trim() || isRoomLocked}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white p-3 rounded-xl transition-all shadow-lg shadow-purple-500/10 cursor-pointer shrink-0 active:scale-95"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty Chat Pane (No room selected) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/60">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 animate-pulse">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Welcome to Ubaka Chat</h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Initiate single direct chats by searching contacts in the sidebar, or create group chats if you have HR manager or Admin privileges.
            </p>
          </div>
        )}

      </div>

      {/* Dynamic Group Creation Modal */}
      {isGroupModalOpen && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-purple-400" />
                <h3 className="text-xs font-bold text-white">Create New Group Chat</h3>
              </div>
              <button 
                onClick={() => setIsGroupModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-850 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <form onSubmit={handleCreateGroup} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              
              {/* Group Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Group Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Finance & Payouts Sync"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              {/* End-to-End Encryption Configuration */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4.5 h-4.5 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">End-to-End Encryption (E2EE)</span>
                      <span className="text-[9px] text-slate-500 block">Only group members can read messages</span>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isE2EEToggled}
                    onChange={(e) => setIsE2EEToggled(e.target.checked)}
                    className="w-4.5 h-4.5 accent-emerald-500 rounded border-slate-800 bg-slate-900 cursor-pointer"
                  />
                </div>
                
                {isE2EEToggled && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-900/60">
                    <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">Group Decryption Passphrase</label>
                    <input 
                      type="password"
                      placeholder="Choose a strong password key..."
                      value={groupPassphrase}
                      onChange={(e) => setGroupPassphrase(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                      required={isE2EEToggled}
                    />
                  </div>
                )}
              </div>

              {/* Members Checklist */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Members ({selectedMemberIds.length})</label>
                <div className="border border-slate-850 rounded-xl max-h-48 overflow-y-auto bg-slate-950 p-2 space-y-1 scrollbar-thin">
                  {contacts.map(c => {
                    const isSelected = selectedMemberIds.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleMemberSelection(c.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected ? 'bg-purple-950/30' : 'hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={c.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                            alt={c.name} 
                            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-850 shrink-0"
                          />
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-slate-200 block truncate">{c.name}</span>
                            <span className="text-[9px] text-slate-500 block truncate">{c.title || c.roleName}</span>
                          </div>
                        </div>
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 accent-purple-500 cursor-pointer pointer-events-none"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {groupCreationError && (
                <div className="text-[10px] text-red-400 font-bold bg-red-950/20 border border-red-500/10 p-3 rounded-xl">
                  {groupCreationError}
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-2 flex gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creatingGroup}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-purple-500/10 cursor-pointer active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                >
                  {creatingGroup ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...
                    </>
                  ) : (
                    'Create Group'
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Chat;
