import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings } from '../types';

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

const defaultSettings: UserSettings = {
  darkMode: false,
  soundEnabled: true,
  notifications: true,
  readReceipts: true,
  lastSeenPrivacy: 'everyone',
  profilePhotoPrivacy: 'everyone',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('koodi_user_settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {}
    }
    return defaultSettings;
  });

  const [darkMode, setDarkMode] = useState<boolean>(settings.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const updated = { ...settings, darkMode };
    setSettings(updated);
    localStorage.setItem('koodi_user_settings', JSON.stringify(updated));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (newSettings.darkMode !== undefined) {
      setDarkMode(newSettings.darkMode);
    }
    localStorage.setItem('koodi_user_settings', JSON.stringify(updated));
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        setDarkMode,
        toggleDarkMode,
        settings,
        updateSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

