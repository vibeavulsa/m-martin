/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const UserContext = createContext(null);

const defaultSettings = {
  animationsEnabled: true,
  notificationsEnabled: true,
  language: 'pt-BR',
  currency: 'BRL',
};

const defaultHomeDisplaySettings = {
  showLoyaltyProgram: true,
  showTestimonials: true,
  showNewsletter: true,
  showCategorySofas: true,
  showCategoryAlmofadas: true,
  showCategoryTravesseiros: true,
  showCategoryHomecareHospitalar: true,
  showCategoryPet: true,
  showCategoryPuffsChaise: true,
};

const defaultProfile = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  avatar: '',
};

const STORAGE_KEY_PROFILE = 'mmartin_user_profile';
const STORAGE_KEY_SETTINGS = 'mmartin_user_settings';
const STORAGE_KEY_HOME_DISPLAY = 'mmartin_home_display';

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return fallback;
}

export function UserProvider({ children }) {
  const [profile, setProfileState] = useState(() =>
    loadFromStorage(STORAGE_KEY_PROFILE, defaultProfile)
  );
  const [settings, setSettingsState] = useState(() =>
    loadFromStorage(STORAGE_KEY_SETTINGS, defaultSettings)
  );
  const [homeDisplaySettings, setHomeDisplaySettings] = useState(() =>
    loadFromStorage(STORAGE_KEY_HOME_DISPLAY, defaultHomeDisplaySettings)
  );
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEY_PROFILE, defaultProfile);
    return Boolean(saved.name && saved.email);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HOME_DISPLAY, JSON.stringify(homeDisplaySettings));
  }, [homeDisplaySettings]);

  const updateProfile = useCallback((data) => {
    setProfileState((prev) => {
      const updated = { ...prev, ...data };
      return updated;
    });
    if (data.name && data.email) {
      setIsLoggedIn(true);
    }
  }, []);

  const updateSettings = useCallback((data) => {
    setSettingsState((prev) => ({ ...prev, ...data }));
  }, []);

  const updateHomeDisplaySettings = useCallback((data) => {
    setHomeDisplaySettings((prev) => ({ ...prev, ...data }));
  }, []);

  const logout = useCallback(() => {
    setProfileState(defaultProfile);
    setIsLoggedIn(false);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(defaultSettings);
  }, []);

  const resetHomeDisplaySettings = useCallback(() => {
    setHomeDisplaySettings(defaultHomeDisplaySettings);
  }, []);

  const value = {
    profile,
    settings,
    homeDisplaySettings,
    isLoggedIn,
    updateProfile,
    updateSettings,
    updateHomeDisplaySettings,
    resetHomeDisplaySettings,
    logout,
    resetSettings,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
