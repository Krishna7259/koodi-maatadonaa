import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { StatusStory, StatusViewer } from '../types';

interface StatusContextType {
  statuses: StatusStory[];
  myStatuses: StatusStory[];
  postStatus: (
    type: 'text' | 'image' | 'video',
    content: string,
    caption?: string,
    backgroundColor?: string,
    fontFamily?: string
  ) => Promise<void>;
  markStatusAsViewed: (statusId: string) => Promise<void>;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const [statuses, setStatuses] = useState<StatusStory[]>([]);
  const [myStatuses, setMyStatuses] = useState<StatusStory[]>([]);

  useEffect(() => {
    if (!userProfile?.uid) {
      setStatuses([]);
      setMyStatuses([]);
      return;
    }

    const statusesRef = collection(db, 'statuses');
    const q = query(statusesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const all: StatusStory[] = [];
      const mine: StatusStory[] = [];

      snapshot.forEach((d) => {
        const item = { id: d.id, ...d.data() } as StatusStory;
        const createdTime = item.createdAt?.toMillis ? item.createdAt.toMillis() : (item.createdAt || now);
        
        // Filter out expired statuses (>24h)
        if (now - createdTime < twentyFourHours) {
          if (item.userId === userProfile.uid) {
            mine.push(item);
          } else {
            all.push(item);
          }
        }
      });

      setStatuses(all);
      setMyStatuses(mine);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const postStatus = async (
    type: 'text' | 'image' | 'video',
    content: string,
    caption?: string,
    backgroundColor?: string,
    fontFamily?: string
  ) => {
    if (!userProfile) return;

    const statusesRef = collection(db, 'statuses');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const payload: Omit<StatusStory, 'id'> = {
      userId: userProfile.uid,
      userName: userProfile.displayName,
      userPhoto: userProfile.photoURL || '',
      type,
      content,
      caption: caption || '',
      backgroundColor: backgroundColor || '#075E54',
      fontFamily: fontFamily || 'sans',
      viewers: [],
      createdAt: serverTimestamp(),
      expiresAt,
    };

    await addDoc(statusesRef, payload);
  };

  const markStatusAsViewed = async (statusId: string) => {
    if (!userProfile) return;

    const statusRef = doc(db, 'statuses', statusId);
    const target = statuses.find(s => s.id === statusId);
    if (!target) return;

    const alreadyViewed = target.viewers?.some(v => v.uid === userProfile.uid);
    if (alreadyViewed) return;

    const newViewer: StatusViewer = {
      uid: userProfile.uid,
      userName: userProfile.displayName,
      userPhoto: userProfile.photoURL || '',
      viewedAt: new Date().toISOString(),
    };

    await updateDoc(statusRef, {
      viewers: [...(target.viewers || []), newViewer]
    });
  };

  return (
    <StatusContext.Provider
      value={{
        statuses,
        myStatuses,
        postStatus,
        markStatusAsViewed,
      }}
    >
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (!context) throw new Error('useStatus must be used within a StatusProvider');
  return context;
};

