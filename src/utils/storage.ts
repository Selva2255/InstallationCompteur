import { Installation, User } from '../types';

const STORAGE_KEYS = {
  INSTALLATIONS: 'prodair_installations',
  CURRENT_USER: 'prodair_current_user',
  REMEMBER_ME: 'prodair_remember_me'
};

export const storage = {
  getInstallations: (): Installation[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INSTALLATIONS);
    return data ? JSON.parse(data) : [];
  },

  saveInstallation: (installation: Installation) => {
    const installations = storage.getInstallations();
    installations.push(installation);
    localStorage.setItem(STORAGE_KEYS.INSTALLATIONS, JSON.stringify(installations));
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getRememberMe: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
  },

  setRememberMe: (remember: boolean) => {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, remember.toString());
  }
};