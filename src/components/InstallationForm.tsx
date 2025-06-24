import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Save, Share, Download, MapPin, Zap, Key, X, Plus, Image, Navigation, Loader } from 'lucide-react';
import { zones } from '../data/zones';
import { Installation, User, Location } from '../types';
import { storage } from '../utils/storage';
import { exportToCSV, shareViaWhatsApp } from '../utils/export';

interface InstallationFormProps {
  user: User;
}

const InstallationForm: React.FC<InstallationFormProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    coffretName: '',
    coffretCode: '',
    zone: '',
    deviceEUI: '',
    appEUI: '',
    appKey: ''
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Obtenir la localisation automatiquement au chargement du composant
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par ce navigateur');
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache pendant 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        setLocation(newLocation);
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Erreur de géolocalisation';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position non disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai de géolocalisation dépassé';
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      options
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const photoData = event.target?.result as string;
          setPhotos(prev => [...prev, photoData]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const generatePhotoName = (index: number) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = `${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;
    return `${formData.coffretCode}_${date}_${time}_${index + 1}.jpg`;
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const openInMaps = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const installation: Installation = {
      id: Date.now().toString(),
      ...formData,
      photos: photos,
      location: location || undefined,
      timestamp: new Date().toISOString(),
      userId: user.name
    };

    storage.saveInstallation(installation);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    // Reset form
    setFormData({
      coffretName: '',
      coffretCode: '',
      zone: '',
      deviceEUI: '',
      appEUI: '',
      appKey: ''
    });
    setPhotos([]);
    // Garder la localisation pour la prochaine installation
    setIsSubmitting(false);
  };

  const handleExport = () => {
    const installations = storage.getInstallations();
    exportToCSV(installations);
  };

  const handleShare = () => {
    if (formData.coffretCode) {
      const installation: Installation = {
        id: Date.now().toString(),
        ...formData,
        photos: photos,
        location: location || undefined,
        timestamp: new Date().toISOString(),
        userId: user.name
      };
      shareViaWhatsApp(installation);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          ✓ Installation enregistrée avec succès !
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-800">Installation Compteur LoRa</h2>
          </div>
          <p className="text-gray-600">Formulaire de saisie des données d'installation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section Géolocalisation */}
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <Navigation className="w-5 h-5 mr-2" />
              Localisation Géographique
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {isGettingLocation && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Obtention de la position...</span>
                  </div>
                )}
                
                {location && !isGettingLocation && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-green-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Position obtenue</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-700">
                        <strong>Coordonnées:</strong><br />
                        {formatCoordinates(location.latitude, location.longitude)}
                      </p>
                      {location.accuracy && (
                        <p className="text-xs text-gray-500 mt-1">
                          Précision: ±{Math.round(location.accuracy)}m
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {locationError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {locationError}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGettingLocation ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  <span>Actualiser Position</span>
                </button>
                
                {location && (
                  <button
                    type="button"
                    onClick={openInMaps}
                    className="flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Voir sur la carte</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Informations du Coffret */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Informations du Coffret
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Coffret
                </label>
                <input
                  type="text"
                  name="coffretName"
                  value={formData.coffretName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ex: Coffret Principal A1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code du Coffret
                </label>
                <input
                  type="text"
                  name="coffretCode"
                  value={formData.coffretCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ex: CF123"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone du Coffret
                </label>
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Sélectionner une zone</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Configuration Technique */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Configuration Technique LoRa
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device EUI
                </label>
                <input
                  type="text"
                  name="deviceEUI"
                  value={formData.deviceEUI}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-mono"
                  placeholder="Ex: 0123456789ABCDEF"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App EUI
                </label>
                <input
                  type="text"
                  name="appEUI"
                  value={formData.appEUI}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-mono"
                  placeholder="Ex: FEDCBA9876543210"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Key
                </label>
                <input
                  type="text"
                  name="appKey"
                  value={formData.appKey}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-mono"
                  placeholder="Ex: 0123456789ABCDEF0123456789ABCDEF"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section Photos */}
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
            <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Photos d'Installation
              <span className="ml-2 text-sm font-normal text-amber-600">
                ({photos.length} photo{photos.length !== 1 ? 's' : ''})
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <Camera className="w-5 h-5" />
                <span>Prendre une photo</span>
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <Upload className="w-5 h-5" />
                <span>Sélectionner des photos</span>
              </button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoCapture}
              className="hidden"
            />
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoCapture}
              className="hidden"
            />

            {/* Galerie de photos */}
            {photos.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-700 flex items-center">
                    <Image className="w-4 h-4 mr-2" />
                    Photos capturées
                  </h4>
                  <button
                    type="button"
                    onClick={() => setPhotos([])}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
                  >
                    Supprimer toutes
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Installation ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300 shadow-sm group-hover:shadow-md transition-shadow duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                        {generatePhotoName(index)}
                      </div>
                    </div>
                  ))}
                  
                  {/* Bouton d'ajout rapide */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors duration-200 bg-gray-50 hover:bg-blue-50"
                  >
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Ajouter</span>
                  </button>
                </div>
              </div>
            )}

            {photos.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune photo ajoutée</p>
                <p className="text-gray-400 text-sm">Cliquez sur les boutons ci-dessus pour ajouter des photos</p>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Enregistrer</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>Exporter CSV</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              disabled={!formData.coffretCode}
              className="flex items-center justify-center space-x-2 bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <Share className="w-5 h-5" />
              <span>Partager WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstallationForm;