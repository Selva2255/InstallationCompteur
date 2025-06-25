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
  cosseElectrique: number; // Cosse Electrique (unités)
  emboutsASertir: number; // Embouts à sertir (unités)
  cosseTubulaire: number; // Cosse tubulaire (unités)
  collierDeSerrage: number; // Collier de serrage (unités)
  cable25mm: number; // Cable de 25 mm (mètres)
  cable16mm: number; // Cable de 16 mm (mètres)
  cable10mm: number; // Cable de 10 mm (mètres)
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
