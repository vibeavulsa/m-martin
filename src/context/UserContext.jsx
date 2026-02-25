/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as db from '../services/dbService';

const UserContext = createContext(null);

const defaultSettings = {
  animationsEnabled: true,
  notificationsEnabled: true,
  language: 'pt-BR',
  currency: 'BRL',
};

const defaultHomeDisplaySettings = {

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
const STORAGE_KEY_CATEGORIES = 'mmartin_admin_categories';

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
  const [categories, setCategories] = useState(() =>
    loadFromStorage(STORAGE_KEY_CATEGORIES, [])
  );
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEY_PROFILE, defaultProfile);
    return Boolean(saved.name && saved.email);
  });

  const dbLoaded = useRef(false);

  // ── Load settings and categories from PostgreSQL on mount ──────────────────
  useEffect(() => {
    if (dbLoaded.current) return;
    dbLoaded.current = true;

    async function loadFromDb() {
      try {
        const [dbUserSettings, dbHomeDisplay, dbCategories] = await Promise.all([
          db.fetchSetting('user_settings').catch(() => null),
          db.fetchSetting('home_display').catch(() => null),
          db.fetchCategories().catch(() => null),
        ]);

        if (dbUserSettings && typeof dbUserSettings === 'object') {
          setSettingsState({ ...defaultSettings, ...dbUserSettings });
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({ ...defaultSettings, ...dbUserSettings }));
        }

        if (dbHomeDisplay && typeof dbHomeDisplay === 'object') {
          setHomeDisplaySettings({ ...defaultHomeDisplaySettings, ...dbHomeDisplay });
          localStorage.setItem(STORAGE_KEY_HOME_DISPLAY, JSON.stringify({ ...defaultHomeDisplaySettings, ...dbHomeDisplay }));
        }

        if (Array.isArray(dbCategories) && dbCategories.length > 0) {
          setCategories(dbCategories);
          localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(dbCategories));
        }
      } catch {
        // DB not available — keep localStorage data
      }
    }

    loadFromDb();
  }, []);

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
    setSettingsState((prev) => {
      const updated = { ...prev, ...data };
      db.saveSetting('user_settings', updated).catch(() => { });
      return updated;
    });
  }, []);

  const updateHomeDisplaySettings = useCallback((data) => {
    setHomeDisplaySettings((prev) => {
      const updated = { ...prev, ...data };
      db.saveSetting('home_display', updated).catch(() => { });
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    setProfileState(defaultProfile);
    setIsLoggedIn(false);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(defaultSettings);
    db.saveSetting('user_settings', defaultSettings).catch(() => { });
  }, []);

  const resetHomeDisplaySettings = useCallback(() => {
    setHomeDisplaySettings(defaultHomeDisplaySettings);
    db.saveSetting('home_display', defaultHomeDisplaySettings).catch(() => { });
  }, []);

  const value = {
    profile,
    settings,
    homeDisplaySettings,
    categories,
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
