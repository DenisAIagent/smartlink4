// Middleware pour normaliser les données entrantes
export const normalizeSmartLinkData = (req, res, next) => {
  const { body } = req;
  
  // Nettoyer et normaliser les champs
  if (body.artist) body.artist = body.artist.trim();
  if (body.title) body.title = body.title.trim();
  if (body.slug) body.slug = body.slug.toLowerCase().trim();
  
  // Gérer coverUrl - utiliser une image par défaut si pas fournie
  if (!body.coverUrl || body.coverUrl.trim() === '') {
    body.coverUrl = 'https://via.placeholder.com/300x300/6366f1/ffffff?text=Cover';
  }
  
  // Normaliser streamingLinks - s'assurer que c'est un objet
  if (!body.streamingLinks || typeof body.streamingLinks !== 'object') {
    body.streamingLinks = {};
  }
  
  // Nettoyer les liens de streaming (supprimer les valeurs vides)
  Object.keys(body.streamingLinks).forEach(key => {
    if (!body.streamingLinks[key] || body.streamingLinks[key].trim() === '') {
      delete body.streamingLinks[key];
    }
  });
  
  // Normaliser les analytics
  if (body.analytics) {
    if (body.analytics.gtmId && body.analytics.gtmId.trim() === '') {
      delete body.analytics.gtmId;
    }
    if (body.analytics.ga4Id && body.analytics.ga4Id.trim() === '') {
      delete body.analytics.ga4Id;
    }
    if (body.analytics.googleAdsId && body.analytics.googleAdsId.trim() === '') {
      delete body.analytics.googleAdsId;
    }
  }
  
  next();
};