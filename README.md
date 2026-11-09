# 🟢 Koodi Maatadona (ಕೂಡಿ ಮಾತನಾಡೋಣ)

> *"Let us talk together"* — A modern, full-stack, WhatsApp-inspired real-time cloud messaging and calling web application built with **React 18**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Firebase Authentication**, **Cloud Firestore**, **Firebase Storage**, **WebRTC**, and **Google Gemini AI**.

---

## 📱 Application Overview

**Koodi Maatadona** is designed as a production-ready, full-stack communication suite built with the visual elegance and familiarity of WhatsApp Web. It is structured from the ground up for seamless backend parity with a future native Android application.

### Key Pillars & Identity:
- **Application Name**: Koodi Maatadona (Kannada: *ಕೂಡಿ ಮಾತನಾಡೋಣ*)
- **Brand Logo**: Dual speech-bubble emblem representing real-time bidirectional dialogue and human connection.
- **Color Palette**:
  - Dark Green: `#075E54`
  - Primary Teal Green: `#128C7E`
  - Message Incoming Bubble: `#FFFFFF` (Dark: `#202C33`)
  - Message Outgoing Bubble: `#D9FDD3` (Dark: `#005C4B`)
  - Background: `#F7F8F6` (Dark: `#111B21`)
  - Doodle Pattern Tint: WhatsApp geometry overlay with subtle opacity.

---

## 🚀 Features Matrix

### 1. 🔐 Phone Authentication with Real OTP & Pre-configured Test Accounts
- **Full Phone Auth Workflow**: Country code selector (+91 India default, US, UK, Canada, UAE, Singapore, etc.), 10-digit mobile number entry, Firebase invisible reCAPTCHA challenge, and 6-digit SMS OTP verification.
- **One-Click Instant Test Access**:
  - **Alice Sharma** (`+91 98765 43210`): Pre-configured contact.
  - **Bob Patel** (`+91 98765 43211`): Pre-configured contact.
  - Perfect for instantly testing two users conversing across two browser tabs without burning SMS quotas.

### 2. 💬 Real-Time One-to-One & Group Messaging
- **Firestore Real-time Subscriptions**: Synchronous delivery with sub-100ms latency.
- **Stable Chat Identifiers**: Deterministic 1-on-1 chat IDs (`uidA_uidB` where `uidA < uidB`) preventing duplicate conversations.
- **Interactive Message Capabilities**:
  - Message status ticks: Single grey tick (Sent), double grey tick (Delivered), double blue tick (Read).
  - Quoted Replies: Swipe or click reply to quote prior messages with full preview.
  - Inline Edit & Recall: Edit messages inline or delete for everyone / for me.
  - Typing Indicators: Real-time debounced typing status shown in sidebar and header.
  - Presence & Last Seen: Dynamic `isOnline` tracking and formatted `last seen today at 4:30 PM`.

### 3. 👥 Group Messaging & Management
- Multi-step group creation with participant selection chips.
- Custom group subject, description, and group icon upload.
- Admin controls: Add new members, remove members, promote admins, or leave group.

### 4. 📎 Media Sharing & Voice Notes
- **Firebase Storage Integration**: Secure client uploads with live progress bar.
- Supported media types:
  - 📷 Photos (JPG, PNG, WebP) with inline lightbox preview.
  - 🎥 Videos (MP4, WebM) with native HTML5 player.
  - 📄 Documents (PDF, DOCX, ZIP) with file size chips and direct download.
  - 🎙️ Voice Notes: Browser microphone recorder with live duration timer and audio playback waveform.

### 5. 📞 Real-Time WebRTC Audio & Video Calling
- **Firestore Signaling**: Complete peer-to-peer connection handshake via `calls` collection with `callerCandidates` and `calleeCandidates` subcollections.
- **Google Public STUN Traversal**: `stun:stun.l.google.com:19302`.
- Audio & video toggle: Mute mic, disable camera, switch to speaker.
- Floating incoming call banner with ringtone, accept, and decline actions.
- Call history log with call duration, status (missed/connected/rejected), and quick callback triggers.

### 6. ⭕ 24-Hour Disappearing Status Updates (Stories)
- **Text Status**: Customizable vibrant background colors and fonts.
- **Media Status**: Photo or video with captions.
- **Timed Story Viewer**: 5-second automatic progression bar, pause on hold/click, next/prev navigation.
- **Viewer Receipts**: Story creators can see the list of viewers with timestamp.
- Automatic 24-hour expiration filter.

### 7. 🤖 Gemini AI Assistant Integration
- Embedded conversational chatbot powered by **Google Gemini 1.5 Flash**.
- **Secure Server-side Architecture**: API key is held exclusively in the Node.js Express server (`/api/gemini/chat`) and never sent to or visible in client JavaScript.
- Smart fallbacks and Kannada/English bilingual prompt suggestions.

---

## 🛠️ Project Architecture

```
koodi-maatadona/
├── server/
│   └── index.js             # Express API proxy for Gemini AI and health checks
├── src/
│   ├── components/
│   │   ├── ai/              # Gemini AI Assistant Chat
│   │   ├── auth/            # Phone login, OTP screen, Profile setup
│   │   ├── calls/           # WebRTC CallModal, IncomingCallModal, CallsTab
│   │   ├── chat/            # MessageBubble, MessageInput, EmojiPicker, MediaUpload
│   │   ├── common/          # KoodiLogo SVG
│   │   ├── dashboard/       # NavigationRail, Sidebar, ChatArea
│   │   ├── modals/          # NewChatModal, NewGroupModal, GroupInfoModal, ProfileSettingsModal
│   │   └── updates/         # UpdatesTab, CreateStatusModal, StatusViewerModal
│   ├── context/
│   │   ├── AuthContext.tsx  # Authentication & Presence state
│   │   ├── CallContext.tsx  # WebRTC calling & signaling engine
│   │   ├── ChatContext.tsx  # Realtime Firestore chats & messages engine
│   │   ├── StatusContext.tsx# 24h stories engine
│   │   └── ThemeContext.tsx # Dark mode & audio preferences
│   ├── firebase/
│   │   └── config.ts        # Firebase Auth, Firestore, Storage singletons
│   ├── types/
│   │   └── index.ts         # TypeScript shared interfaces
│   ├── App.tsx              # Root application layout
│   ├── index.css            # Tailwind directives & WhatsApp scrollbar styling
│   └── main.tsx             # React DOM entrypoint
├── firestore.rules          # Strict security rules for Firestore
├── storage.rules            # Security rules for Firebase Storage
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🏃 Running the Application

### 1. Start the Gemini AI Backend Proxy (Port 5000)
```powershell
cd koodi-maatadona
npm run server
```

### 2. Start the Vite Frontend Development Server (Port 5173)
```powershell
cd koodi-maatadona
npm run dev
```

Open your browser to `http://localhost:5173`.

---

## 🧪 Quick Two-User Testing Guide

1. Open `http://localhost:5173` in a normal browser window.
   - Click **"Test as Alice Sharma"**.
2. Open `http://localhost:5173` in an Incognito / Private window.
   - Click **"Test as Bob Patel"**.
3. In Alice's window, click the **New Chat** button (`+`) and select **Bob Patel**.
4. Send a text message, an emoji, or a photo — observe the message appear instantly in Bob's window with blue double checkmarks upon viewing!
5. Click the **Video Call** icon in the header — watch the incoming call modal pop up on Bob's screen, and click **Accept** to initiate peer-to-peer WebRTC video stream!

