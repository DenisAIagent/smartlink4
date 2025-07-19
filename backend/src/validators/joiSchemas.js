import Joi from 'joi';

export const smartLinkSchema = Joi.object({
  artist: Joi.string().trim().min(1).max(100).required()
    .messages({
      'string.empty': 'Le nom de l\'artiste est requis',
      'string.max': 'Le nom de l\'artiste ne peut pas dépasser 100 caractères'
    }),
    
  title: Joi.string().trim().min(1).max(100).required()
    .messages({
      'string.empty': 'Le titre est requis',
      'string.max': 'Le titre ne peut pas dépasser 100 caractères'
    }),
    
  slug: Joi.string().trim().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).required()
    .messages({
      'string.pattern.base': 'Le slug contient des caractères invalides. Utilisez uniquement des lettres minuscules, des chiffres et des tirets.',
      'string.empty': 'Le slug est requis'
    }),
    
  coverUrl: Joi.string().uri().allow('').default('https://via.placeholder.com/300x300/6366f1/ffffff?text=Cover')
    .messages({
      'string.uri': 'URL de couverture invalide'
    }),
    
  streamingLinks: Joi.object().pattern(
    Joi.string(),
    Joi.string().uri().allow('')
  ).default({}),
  
  analytics: Joi.object({
    gtmId: Joi.string().pattern(/^GTM-[A-Za-z0-9]+$/).allow('').optional()
      .messages({
        'string.pattern.base': 'Format GTM-XXXXXXX attendu pour GTM ID'
      }),
    ga4Id: Joi.string().pattern(/^G-[A-Za-z0-9]+$/).allow('').optional()
      .messages({
        'string.pattern.base': 'Format G-XXXXXXX attendu pour GA4 ID'
      }),
    googleAdsId: Joi.string().pattern(/^AW-[0-9]+$/).allow('').optional()
      .messages({
        'string.pattern.base': 'Format AW-XXXXXXX attendu pour Google Ads ID'
      })
  }).optional().default({})
});

// Middleware Joi
export const validateSmartLink = (req, res, next) => {
  const { error, value } = smartLinkSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false
  });
  
  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      error: 'Données invalides',
      details
    });
  }
  
  // Remplacer req.body par les données validées et normalisées
  req.body = value;
  next();
};