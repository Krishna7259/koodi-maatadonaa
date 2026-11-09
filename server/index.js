import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
const storePath = path.resolve(__dirname, 'data/store.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Load persistent data store
function loadStore() {
  try {
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    }
  } catch (e) {
    console.warn('Could not read store.json, using defaults:', e.message);
  }
  return {
    users: [
      {
        uid: "koodi_test_user_alice",
        phoneNumber: "+91 98765 43210",
        displayName: "Alice Sharma",
        photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        about: "Hey there! I am using Koodi Maatadona 💬",
        isOnline: true
      },
      {
        uid: "koodi_test_user_bob",
        phoneNumber: "+91 98765 43211",
        displayName: "Bob Patel",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        about: "Working remotely from Bengaluru 🚀",
        isOnline: true
      }
    ],
    chats: [],
    messages: {}
  };
}

let store = loadStore();

function saveStore() {
  try {
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Error saving store.json:', e.message);
  }
}

// --------------------------------------------------------------------------
// Real-Time Server-Sent Events (SSE) Hub
// --------------------------------------------------------------------------
const sseClients = new Map(); // uid -> Set<res>

function broadcast(type, payload, recipientUids = null) {
  const dataString = `data: ${JSON.stringify({ type, payload })}\n\n`;

  if (recipientUids && Array.isArray(recipientUids)) {
    recipientUids.forEach((uid) => {
      const clientSet = sseClients.get(uid);
      if (clientSet) {
        clientSet.forEach((res) => {
          try { res.write(dataString); } catch (e) {}
        });
      }
    });
  } else {
    // Broadcast to everyone
    sseClients.forEach((clientSet) => {
      clientSet.forEach((res) => {
        try { res.write(dataString); } catch (e) {}
      });
    });
  }
}

// SSE Connection endpoint
app.get('/api/events', (req, res) => {
  const { uid } = req.query;
  if (!uid) {
    return res.status(400).send('uid parameter is required');
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  res.write(': connected\n\n');

  if (!sseClients.has(uid)) {
    sseClients.set(uid, new Set());
  }
  sseClients.get(uid).add(res);

  // Update user online status
  const user = store.users.find(u => u.uid === uid);
  if (user) {
    user.isOnline = true;
    broadcast('USER_PRESENCE', { uid, isOnline: true });
  }

  const keepAlive = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (e) { clearInterval(keepAlive); }
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
    const clientSet = sseClients.get(uid);
    if (clientSet) {
      clientSet.delete(res);
      if (clientSet.size === 0) {
        sseClients.delete(uid);
        if (user) {
          user.isOnline = false;
          broadcast('USER_PRESENCE', { uid, isOnline: false });
        }
      }
    }
  });
});

// --------------------------------------------------------------------------
// Authentication & User Directory Endpoints
// --------------------------------------------------------------------------
app.post('/api/auth/register-or-login', (req, res) => {
  const { uid, phoneNumber, displayName, photoURL, about } = req.body;
  if (!uid || !phoneNumber) {
    return res.status(400).json({ error: 'uid and phoneNumber are required' });
  }

  let user = store.users.find(u => u.uid === uid || u.phoneNumber === phoneNumber);
  if (user) {
    user.uid = uid;
    if (displayName) user.displayName = displayName;
    if (photoURL !== undefined) user.photoURL = photoURL;
    if (about !== undefined) user.about = about;
    user.isOnline = true;
  } else {
    user = {
      uid,
      phoneNumber,
      displayName: displayName || `User ${phoneNumber.slice(-4)}`,
      photoURL: photoURL || '',
      about: about || 'Hey there! I am using Koodi Maatadona 💬',
      isOnline: true,
    };
    store.users.push(user);
  }

  saveStore();
  broadcast('USER_REGISTERED', user);
  return res.json({ success: true, user });
});

app.get('/api/users', (req, res) => {
  res.json({ users: store.users });
});

// --------------------------------------------------------------------------
// Chat Management Endpoints
// --------------------------------------------------------------------------
app.get('/api/chats', (req, res) => {
  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: 'uid required' });

  const userChats = store.chats.filter(c => c.participants.includes(uid));
  // Sort by updatedAt descending
  userChats.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  res.json({ chats: userChats });
});

app.post('/api/chats/create', (req, res) => {
  const { participants, participantDetails, isGroup, name, description, photoURL } = req.body;
  if (!participants || !Array.isArray(participants) || participants.length < 2) {
    return res.status(400).json({ error: 'At least two participants required' });
  }

  // Check if private chat already exists
  if (!isGroup && participants.length === 2) {
    const sorted = [...participants].sort();
    const existing = store.chats.find(c => !c.isGroup && c.participants.slice().sort().join('_') === sorted.join('_'));
    if (existing) {
      return res.json({ chat: existing, isNew: false });
    }
  }

  const chatId = isGroup 
    ? `group_${Date.now()}` 
    : [...participants].sort().join('_');

  const newChat = {
    id: chatId,
    isGroup: Boolean(isGroup),
    name: name || '',
    description: description || '',
    photoURL: photoURL || '',
    participants,
    participantDetails: participantDetails || {},
    unreadCounts: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.chats.push(newChat);
  if (!store.messages[chatId]) {
    store.messages[chatId] = [];
  }

  saveStore();
  broadcast('NEW_CHAT', newChat, participants);
  return res.json({ chat: newChat, isNew: true });
});

// --------------------------------------------------------------------------
// Real-Time Messages Endpoints
// --------------------------------------------------------------------------
app.get('/api/messages', (req, res) => {
  const { chatId } = req.query;
  if (!chatId) return res.status(400).json({ error: 'chatId required' });

  const msgs = store.messages[chatId] || [];
  res.json({ messages: msgs });
});

app.post('/api/messages/send', (req, res) => {
  const { 
    chatId, 
    senderId, 
    senderName, 
    senderPhoto, 
    text, 
    type = 'text', 
    mediaUrl, 
    mediaName, 
    mediaSize,
    replyTo 
  } = req.body;

  if (!chatId || !senderId) {
    return res.status(400).json({ error: 'chatId and senderId required' });
  }

  const newMsg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    chatId,
    senderId,
    senderName: senderName || 'User',
    senderPhoto: senderPhoto || '',
    text: (text || '').trim(),
    type,
    mediaUrl: mediaUrl || '',
    mediaName: mediaName || '',
    mediaSize: mediaSize || 0,
    replyTo: replyTo || undefined,
    status: 'sent',
    readBy: [senderId],
    createdAt: new Date().toISOString(),
  };

  if (!store.messages[chatId]) {
    store.messages[chatId] = [];
  }
  store.messages[chatId].push(newMsg);

  // Update chat last message
  const chat = store.chats.find(c => c.id === chatId);
  if (chat) {
    chat.lastMessage = {
      text: newMsg.text || (newMsg.type === 'image' ? '📷 Photo' : '📎 Attachment'),
      senderId: newMsg.senderId,
      timestamp: newMsg.createdAt,
      type: newMsg.type,
      status: 'sent',
    };
    chat.updatedAt = newMsg.createdAt;
  }

  saveStore();

  const recipientUids = chat ? chat.participants : null;
  broadcast('NEW_MESSAGE', newMsg, recipientUids);

  return res.json({ success: true, message: newMsg });
});

// --------------------------------------------------------------------------
// WebRTC Calling Signaling via SSE
// --------------------------------------------------------------------------
app.post('/api/calls/offer', (req, res) => {
  const { caller, calleeId, offer, type } = req.body;
  broadcast('CALL_OFFER', { caller, calleeId, offer, type }, [calleeId]);
  res.json({ success: true });
});

app.post('/api/calls/answer', (req, res) => {
  const { callerId, answer } = req.body;
  broadcast('CALL_ANSWER', { callerId, answer }, [callerId]);
  res.json({ success: true });
});

app.post('/api/calls/ice', (req, res) => {
  const { targetUid, candidate } = req.body;
  broadcast('CALL_ICE', { candidate }, [targetUid]);
  res.json({ success: true });
});

app.post('/api/calls/end', (req, res) => {
  const { targetUid } = req.body;
  broadcast('CALL_ENDED', {}, [targetUid]);
  res.json({ success: true });
});

// --------------------------------------------------------------------------
// Google Gemini AI Chatbot
// --------------------------------------------------------------------------
let apiKey = process.env.GEMINI_API_KEY || '';
let genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Koodi Maatadona Server',
    geminiConfigured: Boolean(apiKey && apiKey.length > 10 && !apiKey.includes('your_')),
    registeredUsersCount: store.users.length,
    activeSSEConnections: sseClients.size,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/gemini/status', (req, res) => {
  res.json({
    configured: Boolean(apiKey && apiKey.length > 10 && !apiKey.includes('your_')),
    keyPreview: apiKey && apiKey.length > 8 ? `${apiKey.slice(0, 5)}...${apiKey.slice(-4)}` : null,
  });
});

app.post('/api/gemini/set-key', async (req, res) => {
  try {
    const { newApiKey } = req.body;
    if (!newApiKey || typeof newApiKey !== 'string' || newApiKey.trim().length < 15) {
      return res.status(400).json({ error: 'Please provide a valid Gemini API key (starts with AIzaSy...)' });
    }

    const trimmedKey = newApiKey.trim();
    const testGenAI = new GoogleGenerativeAI(trimmedKey);
    const testModel = testGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const testResult = await testModel.generateContent('Say "OK"');
    const reply = testResult.response.text();

    apiKey = trimmedKey;
    genAI = testGenAI;

    try {
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }
      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${trimmedKey}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${trimmedKey}\n`;
      }
      fs.writeFileSync(envPath, envContent, 'utf-8');
    } catch (fsErr) {
      console.warn('Could not write to .env:', fsErr.message);
    }

    return res.json({
      success: true,
      message: 'Gemini API key verified and configured successfully!',
      testReply: reply.trim(),
    });
  } catch (err) {
    console.error('Failed to configure Gemini API key:', err);
    return res.status(400).json({
      error: 'Invalid Gemini API key: ' + (err.message || 'Verification call failed'),
    });
  }
});

app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, history = [] } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt text is required' });
    }

    if (genAI && apiKey && !apiKey.includes('your_')) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const formattedHistory = history.slice(-10).map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));

        const chat = model.startChat({
          history: formattedHistory,
          systemInstruction: {
            parts: [{
              text: "You are the Koodi Maatadona AI Assistant, a friendly, intelligent, and helpful conversational partner in a modern WhatsApp-style messaging application. Help users with questions, writing, brainstorming, programming, and advice. You understand Kannada and English fluently. Keep answers clear, structured with markdown when helpful, and conversational."
            }]
          }
        });

        const result = await chat.sendMessage(prompt);
        return res.json({
          text: result.response.text(),
          provider: 'google-gemini',
          timestamp: new Date().toISOString(),
        });
      } catch (geminiError) {
        console.warn('[Gemini API warning]', geminiError.message);
      }
    }

    // Intelligent local fallback
    const localResponse = generateLocalResponse(prompt);
    return res.json({
      text: localResponse,
      provider: 'koodi-local-engine',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to process AI response',
      message: error.message,
    });
  }
});

function generateLocalResponse(prompt) {
  const p = prompt.toLowerCase().trim();
  if (p.includes('hello') || p.includes('hi') || p.includes('hey') || p.includes('namaskara')) {
    return '👋 Namaskara! Hello! I am the **Koodi Maatadona AI Assistant**.\n\nI am right here in your messaging app to help you with quick answers, ideas, translations, programming tips, or drafting messages. How can I help you today?';
  }
  if (p.includes('koodi') || p.includes('what is this') || p.includes('about')) {
    return '📱 **About Koodi Maatadona**:\n\n"Koodi Maatadona" means *"Let us talk together"* in Kannada. It is a full-featured, modern messaging application with real-time multi-device sync, WebRTC calls, and Gemini AI.';
  }
  return `🤖 **Koodi Maatadona Assistant**:\n\nI received your query: *"${prompt}"*.\n\nYou can ask me for message drafts, language translations, coding help, or general questions!`;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 Koodi Maatadona Server running on port ${PORT}`);
  console.log(`🌐 Local network listening on 0.0.0.0:${PORT}`);
  console.log(`👥 Registered users: ${store.users.length}`);
  console.log(`🔑 Gemini API configured: ${Boolean(apiKey && !apiKey.includes('your_'))}`);
  console.log(`===============================================`);
});
