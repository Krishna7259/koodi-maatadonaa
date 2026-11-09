export interface UserProfile {
  uid: string;
  phoneNumber: string;
  displayName: string;
  photoURL?: string;
  about?: string;
  isOnline: boolean;
  lastSeen?: any;
  createdAt?: any;
  blockedUsers?: string[];
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'voice' | 'document' | 'call';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface ReplyContext {
  id: string;
  text: string;
  senderName: string;
  type?: MessageType;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  type: MessageType;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  mediaDuration?: number;
  replyTo?: ReplyContext;
  edited?: boolean;
  deleted?: boolean;
  status: MessageStatus;
  readBy: string[];
  createdAt: any;
}

export interface ParticipantInfo {
  displayName: string;
  photoURL?: string;
  phoneNumber: string;
  isOnline?: boolean;
  lastSeen?: any;
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name?: string;
  description?: string;
  photoURL?: string;
  participants: string[];
  participantDetails: Record<string, ParticipantInfo>;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: any;
    type: MessageType;
    status?: MessageStatus;
  };
  unreadCounts: Record<string, number>;
  typing?: Record<string, boolean>;
  admins?: string[];
  createdBy?: string;
  createdAt: any;
  updatedAt: any;
}

export interface StatusViewer {
  uid: string;
  userName: string;
  userPhoto?: string;
  viewedAt: any;
}

export interface StatusStory {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  type: 'text' | 'image' | 'video';
  content: string; // text string or media URL
  caption?: string;
  backgroundColor?: string;
  fontFamily?: string;
  viewers: StatusViewer[];
  createdAt: any;
  expiresAt: any;
}

export type CallType = 'audio' | 'video';
export type CallStatus = 'offering' | 'ringing' | 'connected' | 'ended' | 'rejected' | 'busy';

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerPhoto?: string;
  calleeId: string;
  calleeName: string;
  calleePhoto?: string;
  type: CallType;
  status: CallStatus;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  createdAt: any;
  duration?: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: any;
  isError?: boolean;
}

export interface UserSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  notifications: boolean;
  readReceipts: boolean;
  lastSeenPrivacy: 'everyone' | 'contacts' | 'nobody';
  profilePhotoPrivacy: 'everyone' | 'contacts' | 'nobody';
}

