import { Installation } from '../types';

export const downloadPhoto = (photoData: string, fileName: string) => {
  try {
    const link = document.createElement('a');
    link.href = photoData;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erreur lors du téléchargement de la photo:', error);
  }
};

export const exportToCSV = (installations: Installation[]) => {
  const headers = [
    'Date/Heure',
    'Utilisateur',
    'Nom du Coffret',
    'Code du Coffret',
    'Zone',
    'Device EUI',
    'App EUI',
    'App Key',
    'Latitude',
    'Longitude',
    'Précision GPS (m)',
    'Nombre de Photos',
    'Noms des Photos',
    'Câbles électriques (unités)',
    'Câbles de prélèvement (unités)',
    'Câbles tubulaires (unités)',
    'Colliers de serrage (unités)',
    'Câble 25mm (m)',
    'Câble 16mm (m)',
    'Câble 10mm (m)',
    'Total équipements (unités)',
    'Total câbles (m)'
  ];

  const csvContent = [
    headers.join(','),
    ...installations.map(installation => {
      const totalEquipments = (installation.materialUsed?.electricCables || 0) + 
                             (installation.materialUsed?.samplingCables || 0) + 
                             (installation.materialUsed?.tubularCables || 0) + 
                             (installation.materialUsed?.clamps || 0);
      
      const totalCables = ((installation.materialUsed?.cable25mm || 0) + 
                          (installation.materialUsed?.cable16mm || 0) + 
                          (installation.materialUsed?.cable10mm || 0)).toFixed(1);

      return [
        new Date(installation.timestamp).toLocaleString('fr-FR'),
        installation.userId,
        `"${installation.coffretName}"`,
        installation.coffretCode,
        installation.zone,
        installation.deviceEUI,
        installation.appEUI,
        installation.appKey,
        installation.location ? installation.location.latitude.toFixed(6) : 'Non disponible',
        installation.location ? installation.location.longitude.toFixed(6) : 'Non disponible',
        installation.location && installation.location.accuracy ? 
          Math.round(installation.location.accuracy).toString() : 'Non disponible',
        installation.photos.length.toString(),
        installation.photoNames && installation.photoNames.length > 0 ? 
          `"${installation.photoNames.join('; ')}"` : 
          (installation.photos.length > 0 ? 
            `"${installation.photos.map((_, index) => {
              const now = new Date(installation.timestamp);
              const date = now.toISOString().split('T')[0];
              const time = `${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;
              return `${installation.coffretCode}_${date}_${time}_${index + 1}.jpg`;
            }).join('; ')}"` : 
            'Aucune photo'),
        installation.materialUsed?.electricCables || 0,
        installation.materialUsed?.samplingCables || 0,
        installation.materialUsed?.tubularCables || 0,
        installation.materialUsed?.clamps || 0,
        installation.materialUsed?.cable25mm || 0,
        installation.materialUsed?.cable16mm || 0,
        installation.materialUsed?.cable10mm || 0,
        totalEquipments,
        totalCables
      ].join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `installations_prodair_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const shareViaWhatsApp = (installation: Installation) => {
  const photoInfo = installation.photos.length > 0 ? 
    `📷 ${installation.photos.length} photo${installation.photos.length > 1 ? 's' : ''} d'installation` : 
    '📷 Aucune photo';

  const locationInfo = installation.location ? 
    `📍 Position GPS: ${installation.location.latitude.toFixed(6)}, ${installation.location.longitude.toFixed(6)}
🎯 Précision: ±${installation.location.accuracy ? Math.round(installation.location.accuracy) : '?'}m
🗺️ Voir sur carte: https://www.google.com/maps?q=${installation.location.latitude},${installation.location.longitude}` : 
    '📍 Position GPS non disponible';

  const materialInfo = installation.materialUsed ? 
    `📦 *Matériel consommé:*
• Câbles électriques: ${installation.materialUsed.electricCables} unités
• Câbles de prélèvement: ${installation.materialUsed.samplingCables} unités  
• Câbles tubulaires: ${installation.materialUsed.tubularCables} unités
• Colliers de serrage: ${installation.materialUsed.clamps} unités
• Câble 25mm: ${installation.materialUsed.cable25mm}m
• Câble 16mm: ${installation.materialUsed.cable16mm}m
• Câble 10mm: ${installation.materialUsed.cable10mm}m
• *Total:* ${(installation.materialUsed.electricCables + installation.materialUsed.samplingCables + installation.materialUsed.tubularCables + installation.materialUsed.clamps)} équipements, ${(installation.materialUsed.cable25mm + installation.materialUsed.cable16mm + installation.materialUsed.cable10mm).toFixed(1)}m de câbles` :
    '📦 Aucun matériel renseigné';

  const message = `🔧 *Nouvelle Installation LoRa - Prod'Air*

📋 *Détails du Coffret:*
• Nom: ${installation.coffretName}
• Code: ${installation.coffretCode}
• Zone: ${installation.zone}

🔧 *Configuration Technique:*
• Device EUI: ${installation.deviceEUI}
• App EUI: ${installation.appEUI}
• App Key: ${installation.appKey}

📍 *Localisation:*
${locationInfo}

${materialInfo}

📅 Date: ${new Date(installation.timestamp).toLocaleString('fr-FR')}
👤 Installé par: ${installation.userId}

${photoInfo}

---
*Hadirate Al Anwar - Installation Compteurs LoRa*`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};
