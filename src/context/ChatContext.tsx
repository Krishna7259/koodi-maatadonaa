import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  getDocs, 
  getDoc,
  deleteDoc,
  increment
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from '../firebase/config';
import { useAuth, TEST_ACCOUNTS } from './AuthContext';
import { Chat, Message, MessageType, UserProfile, ReplyContext } from '../types';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  loadingChats: boolean;
  loadingMessages: boolean;
  setActiveChat: (chat: Chat | null) => void;
  startOrGetPrivateChat: (targetUser: UserProfile) => Promise<Chat>;
  sendMessage: (
    text: string, 
    type?: MessageType, 
    mediaUrl?: string, 
    mediaName?: string, 
    mediaSize?: number,
    replyTo?: ReplyContext
  ) => Promise<void>;
  editMessage: (messageId: string, newText: string) => Promise<void>;
  deleteMessage: (messageId: string, forEveryone: boolean) => Promise<void>;
  uploadMedia: (file: File, onProgress?: (percent: number) => void) => Promise<{ url: string; name: string; size: number }>;
  setTyping: (isTyping: boolean) => Promise<void>;
  createGroup: (name: string, description: string, memberUids: string[], photoURL?: string) => Promise<Chat>;
  addMembersToGroup: (groupId: string, newUids: string[]) => Promise<void>;
  removeMemberFromGroup: (groupId: string, uidToRemove: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  searchUsers: (searchTerm: string) => Promise<UserProfile[]>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Initial conversation between Alice & Bob
const INITIAL_DEMO_CHAT: Chat = {
  id: 'koodi_test_user_alice_koodi_test_user_bob',
  isGroup: false,
  participants: ['koodi_test_user_alice', 'koodi_test_user_bob'],
  participantDetails: {
    koodi_test_user_alice: {
      displayName: 'Alice Sharma',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      phoneNumber: '+91 98765 43210',
      isOnline: true,
    },
    koodi_test_user_bob: {
      displayName: 'Bob Patel',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      phoneNumber: '+91 98765 43211',
      isOnline: true,
    }
  },
  lastMessage: {
    text: 'Hey! Welcome to Koodi Maatadona 💬',
    senderId: 'koodi_test_user_bob',
    timestamp: new Date().toISOString(),
    type: 'text',
    status: 'read'
  },
  unreadCounts: {
    koodi_test_user_alice: 0,
    koodi_test_user_bob: 0
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const INITIAL_DEMO_MESSAGES: Message[] = [
  {
    id: 'demo_msg_1',
    chatId: INITIAL_DEMO_CHAT.id,
    senderId: 'koodi_test_user_bob',
    senderName: 'Bob Patel',
    senderPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    text: 'Namaskara! Welcome to Koodi Maatadona! 🚀',
    type: 'text',
    status: 'read',
    readBy: ['koodi_test_user_alice', 'koodi_test_user_bob'],
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'demo_msg_2',
    chatId: INITIAL_DEMO_CHAT.id,
    senderId: 'koodi_test_user_alice',
    senderName: 'Alice Sharma',
    senderPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    text: 'Hey! The interface looks just like WhatsApp. Real-time messaging and calling are working great! 💬✨',
    type: 'text',
    status: 'read',
    readBy: ['koodi_test_user_alice', 'koodi_test_user_bob'],
    createdAt: new Date(Date.now() - 300000).toISOString(),
  }
];

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  // 1. Listen for real-time Server-Sent Events (SSE) from the Node.js backend
  useEffect(() => {
    if (!userProfile?.uid) return;

    let sse: EventSource | null = null;
    try {
      sse = new EventSource(`/api/events?uid=${userProfile.uid}`);

      sse.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);

          if (type === 'NEW_MESSAGE') {
            const newMsg = payload as Message;
            // If viewing this chat, append message
            setMessages((prev) => {
              if (activeChat && activeChat.id === newMsg.chatId && !prev.some(m => m.id === newMsg.id)) {
                return [...prev, newMsg];
              }
              return prev;
            });

            // Update chat lastMessage
            setChats((prev) => {
              return prev.map((c) => {
                if (c.id === newMsg.chatId) {
                  return {
                    ...c,
                    lastMessage: {
                      text: newMsg.text || (newMsg.type === 'image' ? '📷 Photo' : '📎 Attachment'),
                      senderId: newMsg.senderId,
                      timestamp: newMsg.createdAt,
                      type: newMsg.type,
                      status: newMsg.status,
                    },
                    updatedAt: newMsg.createdAt,
                  };
                }
                return c;
              });
            });
          } else if (type === 'NEW_CHAT') {
            const newChat = payload as Chat;
            setChats((prev) => {
              if (!prev.some(c => c.id === newChat.id)) {
                return [newChat, ...prev];
              }
              return prev;
            });
          }
        } catch (e) {}
      };
    } catch (e) {
      console.warn('SSE connection notice:', e);
    }

    return () => {
      sse?.close();
    };
  }, [userProfile?.uid, activeChat?.id]);

  // 2. Load chats whenever userProfile changes
  useEffect(() => {
    if (!userProfile?.uid) {
      setChats([]);
      setActiveChat(null);
      setLoadingChats(false);
      return;
    }

    loadLocalAndServerChats();

    // If real Firebase is configured, also listen to Firestore
    if (isFirebaseConfigured) {
      try {
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', userProfile.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const list: Chat[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as Chat);
          });

          if (list.length > 0) {
            setChats(list);
            saveChatsToStorage(list);
          }
        }, () => {});

        return () => unsubscribe();
      } catch (e) {}
    }
  }, [userProfile?.uid]);

  const loadLocalAndServerChats = () => {
    if (!userProfile) return;

    // 1. Fetch from server
    fetch(`/api/chats?uid=${userProfile.uid}`)
      .then(r => r.json())
      .then(data => {
        if (data.chats && Array.isArray(data.chats) && data.chats.length > 0) {
          setChats(data.chats);
          saveChatsToStorage(data.chats);
          if (!activeChat) setActiveChat(data.chats[0]);
          return;
        }
        fallbackToLocalStorage();
      })
      .catch(() => {
        fallbackToLocalStorage();
      });
  };

  const fallbackToLocalStorage = () => {
    if (!userProfile) return;
    try {
      const stored = localStorage.getItem(`koodi_chats_${userProfile.uid}`);
      if (stored) {
        const parsed = JSON.parse(stored) as Chat[];
        if (parsed.length > 0) {
          setChats(parsed);
          if (!activeChat) setActiveChat(parsed[0]);
          return;
        }
      }

      // Default conversation with other test user
      const otherTestUser = userProfile.uid === 'koodi_test_user_bob' 
        ? TEST_ACCOUNTS[0] // Alice
        : TEST_ACCOUNTS[1]; // Bob

      const demoChat: Chat = {
        ...INITIAL_DEMO_CHAT,
        id: [userProfile.uid, otherTestUser.uid].sort().join('_'),
        participants: [userProfile.uid, otherTestUser.uid],
        participantDetails: {
          [userProfile.uid]: {
            displayName: userProfile.displayName,
            photoURL: userProfile.photoURL || '',
            phoneNumber: userProfile.phoneNumber,
            isOnline: true,
          },
          [otherTestUser.uid]: {
            displayName: otherTestUser.displayName,
            photoURL: otherTestUser.photoURL || '',
            phoneNumber: otherTestUser.phoneNumber,
            isOnline: true,
          }
        }
      };

      const initialList = [demoChat];
      localStorage.setItem(`koodi_msgs_${demoChat.id}`, JSON.stringify(INITIAL_DEMO_MESSAGES));
      setChats(initialList);
      setActiveChat(demoChat);
      saveChatsToStorage(initialList);
    } catch (e) {}
  };

  const saveChatsToStorage = (chatList: Chat[]) => {
    if (!userProfile) return;
    try {
      localStorage.setItem(`koodi_chats_${userProfile.uid}`, JSON.stringify(chatList));
    } catch (e) {}
  };

  // 3. Load messages whenever activeChat changes
  useEffect(() => {
    if (!activeChat?.id || !userProfile?.uid) {
      setMessages([]);
      return;
    }

    // A. Fetch from central server
    fetch(`/api/messages?chatId=${activeChat.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
          localStorage.setItem(`koodi_msgs_${activeChat.id}`, JSON.stringify(data.messages));
          return;
        }
        loadMessagesFromStorage();
      })
      .catch(() => {
        loadMessagesFromStorage();
      });

    // B. If Firestore configured, also listen to Firestore
    if (isFirebaseConfigured) {
      try {
        const messagesRef = collection(db, 'chats', activeChat.id, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const msgs: Message[] = [];
          snapshot.forEach((d) => {
            msgs.push({ id: d.id, ...d.data() } as Message);
          });
          if (msgs.length > 0) {
            setMessages(msgs);
            localStorage.setItem(`koodi_msgs_${activeChat.id}`, JSON.stringify(msgs));
          }
        }, () => {});

        return () => unsubscribe();
      } catch (e) {}
    }
  }, [activeChat?.id, userProfile?.uid]);

  const loadMessagesFromStorage = () => {
    if (!activeChat) return;
    try {
      const storedMsgs = localStorage.getItem(`koodi_msgs_${activeChat.id}`);
      if (storedMsgs) {
        setMessages(JSON.parse(storedMsgs));
      } else if (activeChat.id === INITIAL_DEMO_CHAT.id) {
        setMessages(INITIAL_DEMO_MESSAGES);
      } else {
        setMessages([]);
      }
    } catch (e) {}
  };

  // Start or get private chat
  const startOrGetPrivateChat = async (targetUser: UserProfile): Promise<Chat> => {
    if (!userProfile) throw new Error('Not logged in');

    const participantUids = [userProfile.uid, targetUser.uid].sort();
    const chatId = participantUids.join('_');

    const existing = chats.find(c => c.id === chatId);
    if (existing) {
      setActiveChat(existing);
      return existing;
    }

    const newChat: Chat = {
      id: chatId,
      isGroup: false,
      participants: participantUids,
      participantDetails: {
        [userProfile.uid]: {
          displayName: userProfile.displayName,
          photoURL: userProfile.photoURL || '',
          phoneNumber: userProfile.phoneNumber,
          isOnline: true,
        },
        [targetUser.uid]: {
          displayName: targetUser.displayName,
          photoURL: targetUser.photoURL || '',
          phoneNumber: targetUser.phoneNumber,
          isOnline: true,
        }
      },
      unreadCounts: {
        [userProfile.uid]: 0,
        [targetUser.uid]: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setActiveChat(newChat);
    saveChatsToStorage(updatedChats);

    // Save on central server
    fetch('/api/chats/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChat)
    }).catch(() => {});

    // Save to Firestore in background
    if (isFirebaseConfigured) {
      try {
        const chatRef = doc(db, 'chats', chatId);
        setDoc(chatRef, newChat, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    return newChat;
  };

  // Send message
  const sendMessage = async (
    text: string, 
    type: MessageType = 'text', 
    mediaUrl?: string, 
    mediaName?: string, 
    mediaSize?: number,
    replyTo?: ReplyContext
  ) => {
    if (!activeChat || !userProfile) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      chatId: activeChat.id,
      senderId: userProfile.uid,
      senderName: userProfile.displayName,
      senderPhoto: userProfile.photoURL || '',
      text: text.trim(),
      type,
      mediaUrl: mediaUrl || '',
      mediaName: mediaName || '',
      mediaSize: mediaSize || 0,
      replyTo: replyTo || undefined,
      status: 'sent',
      readBy: [userProfile.uid],
      createdAt: new Date().toISOString(),
    };

    // 1. Immediately append to active state
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    localStorage.setItem(`koodi_msgs_${activeChat.id}`, JSON.stringify(updatedMessages));

    // 2. Update chat list preview
    const updatedChats = chats.map((c) => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          lastMessage: {
            text: newMsg.text || (type === 'image' ? '📷 Photo' : '📎 Attachment'),
            senderId: userProfile.uid,
            timestamp: newMsg.createdAt,
            type,
            status: 'sent' as const,
          },
          updatedAt: newMsg.createdAt,
        };
      }
      return c;
    });

    setChats(updatedChats);
    saveChatsToStorage(updatedChats);

    // 3. Post to central server (broadcasts via SSE to all other devices/browsers in real time)
    fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    }).catch(() => {});

    // 4. If Firestore configured, save in background
    if (isFirebaseConfigured) {
      try {
        const messagesRef = collection(db, 'chats', activeChat.id, 'messages');
        addDoc(messagesRef, { ...newMsg, createdAt: serverTimestamp() }).catch(() => {});
      } catch (e) {}
    }
  };

  const editMessage = async (messageId: string, newText: string) => {
    if (!activeChat) return;
    const updated = messages.map(m => m.id === messageId ? { ...m, text: newText, edited: true } : m);
    setMessages(updated);
    localStorage.setItem(`koodi_msgs_${activeChat.id}`, JSON.stringify(updated));
  };

  const deleteMessage = async (messageId: string, forEveryone: boolean) => {
    if (!activeChat) return;
    const updated = messages.map(m => {
      if (m.id === messageId) {
        return forEveryone ? { ...m, text: '🚫 This message was deleted', deleted: true } : null;
      }
      return m;
    }).filter(Boolean) as Message[];

    setMessages(updated);
    localStorage.setItem(`koodi_msgs_${activeChat.id}`, JSON.stringify(updated));
  };

  const uploadMedia = async (file: File, onProgress?: (percent: number) => void): Promise<{ url: string; name: string; size: number }> => {
    if (onProgress) onProgress(100);
    const localUrl = URL.createObjectURL(file);
    return { url: localUrl, name: file.name, size: file.size };
  };

  const setTyping = async (isTyping: boolean) => {};

  const createGroup = async (name: string, description: string, memberUids: string[], photoURL?: string): Promise<Chat> => {
    if (!userProfile) throw new Error('Not logged in');
    const allMembers = Array.from(new Set([userProfile.uid, ...memberUids]));
    const groupId = `group_${Date.now()}`;

    const newGroup: Chat = {
      id: groupId,
      isGroup: true,
      name,
      description,
      photoURL: photoURL || '',
      participants: allMembers,
      admins: [userProfile.uid],
      createdBy: userProfile.uid,
      participantDetails: {
        [userProfile.uid]: {
          displayName: userProfile.displayName,
          photoURL: userProfile.photoURL || '',
          phoneNumber: userProfile.phoneNumber,
          isOnline: true,
        }
      },
      unreadCounts: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newGroup, ...chats];
    setChats(updated);
    setActiveChat(newGroup);
    saveChatsToStorage(updated);

    fetch('/api/chats/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGroup)
    }).catch(() => {});

    return newGroup;
  };

  const addMembersToGroup = async (groupId: string, newUids: string[]) => {
    setChats(prev => prev.map(c => c.id === groupId ? { ...c, participants: Array.from(new Set([...c.participants, ...newUids])) } : c));
  };

  const removeMemberFromGroup = async (groupId: string, uidToRemove: string) => {
    setChats(prev => prev.map(c => c.id === groupId ? { ...c, participants: c.participants.filter(id => id !== uidToRemove) } : c));
  };

  const leaveGroup = async (groupId: string) => {
    if (!userProfile) return;
    setChats(prev => prev.filter(c => c.id !== groupId));
    if (activeChat?.id === groupId) setActiveChat(null);
  };

  // Comprehensive user search (queries server so all registered friends appear instantly)
  const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
    const term = searchTerm.toLowerCase().trim();
    let allUsers: UserProfile[] = [...TEST_ACCOUNTS];

    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          allUsers = data.users;
        }
      }
    } catch (e) {}

    // Exclude current logged in user
    const others = allUsers.filter(u => u.uid !== userProfile?.uid);

    if (!term) return others;

    return others.filter(u => 
      (u.displayName && u.displayName.toLowerCase().includes(term)) ||
      (u.phoneNumber && u.phoneNumber.toLowerCase().includes(term))
    );
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages,
        loadingChats,
        loadingMessages,
        setActiveChat,
        startOrGetPrivateChat,
        sendMessage,
        editMessage,
        deleteMessage,
        uploadMedia,
        setTyping,
        createGroup,
        addMembersToGroup,
        removeMemberFromGroup,
        leaveGroup,
        searchUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
