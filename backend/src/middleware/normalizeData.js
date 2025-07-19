// Middleware pour normaliser les données entrantes
export const normalizeSmartLinkData = (req, res, next) => {
  try {
    const { body } = req;
    
    // Vérifier que body existe
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Corps de requête invalide' });
    }
    
    // Nettoyer et normaliser les champs
    if (body.artist && typeof body.artist === 'string') {
      body.artist = body.artist.trim();
    }
    if (body.title && typeof body.title === 'string') {
      body.title = body.title.trim();
    }
    if (body.slug && typeof body.slug === 'string') {
      body.slug = body.slug.toLowerCase().trim();
    }
    
    // Gérer coverUrl - utiliser une image par défaut si pas fournie
    if (!body.coverUrl || (typeof body.coverUrl === 'string' && body.coverUrl.trim() === '')) {
      body.coverUrl = 'https://via.placeholder.com/300x300/6366f1/ffffff?text=Cover';
    }
    
    // Normaliser streamingLinks - s'assurer que c'est un objet
    if (!body.streamingLinks || typeof body.streamingLinks !== 'object' || Array.isArray(body.streamingLinks)) {
      body.streamingLinks = {};
    }
    
    // Nettoyer les liens de streaming (supprimer les valeurs vides)
    Object.keys(body.streamingLinks).forEach(key => {
      const link = body.streamingLinks[key];
      if (!link || (typeof link === 'string' && link.trim() === '')) {
        delete body.streamingLinks[key];
      }
    });
    
    // Normaliser les analytics
    if (body.analytics && typeof body.analytics === 'object' && !Array.isArray(body.analytics)) {
      if (body.analytics.gtmId && typeof body.analytics.gtmId === 'string' && body.analytics.gtmId.trim() === '') {
        delete body.analytics.gtmId;
      }
      if (body.analytics.ga4Id && typeof body.analytics.ga4Id === 'string' && body.analytics.ga4Id.trim() === '') {
        delete body.analytics.ga4Id;
      }
      if (body.analytics.googleAdsId && typeof body.analytics.googleAdsId === 'string' && body.analytics.googleAdsId.trim() === '') {
        delete body.analytics.googleAdsId;
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in normalizeSmartLinkData middleware:', error);
    res.status(500).json({ error: 'Erreur de normalisation des données' });
  }
};