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

export interface MaterialUsed {
  electricCables: number;
  samplingCables: number;
  tubularCables: number;
  clamps: number;
  cable25mm: number; // en mètres
  cable16mm: number; // en mètres
  cable10mm: number; // en mètres
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
  photoNames: string[]; // Noms des fichiers photos
  location?: Location;
  materialUsed: MaterialUsed;
  timestamp: string;
  userId: string;
}

export interface AppState {
  currentUser: User | null;
  installations: Installation[];
  isAuthenticated: boolean;
}
