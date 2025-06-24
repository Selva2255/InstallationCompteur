export interface User {
  id: string;
  name: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface Installation {
  id: string;
  coffretName: string;
  coffretCode: string;
  zone: string;
  deviceEUI: string;
  appEUI: string;
  appKey: string;
  photos: string[];
  location?: Location;
  timestamp: string;
  userId: string;
}

export interface AppState {
  currentUser: User | null;
  installations: Installation[];
  isAuthenticated: boolean;
}