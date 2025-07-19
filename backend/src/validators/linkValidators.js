import { body, param } from 'express-validator';

export const createLinkValidation = [
  body('artist')
    .trim()
    .notEmpty()
    .withMessage('Le nom de l\'artiste est requis')
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nom de l\'artiste doit contenir entre 1 et 100 caractères'),
    
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Le titre est requis')
    .isLength({ min: 1, max: 100 })
    .withMessage('Le titre doit contenir entre 1 et 100 caractères'),
    
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Le slug est requis')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Le slug contient des caractères invalides. Utilisez uniquement des lettres minuscules, des chiffres et des tirets.'),
    
  body('coverUrl')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .withMessage('URL de couverture invalide'),
    
  body('streamingLinks')
    .isObject()
    .withMessage('Les liens de streaming doivent être un objet'),
    
  // GTM ID - NOTRE VALIDATION AMÉLIORÉE (accepte mixed case)
  body('gtmId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^GTM-[A-Za-z0-9]+$/.test(value.trim());
    })
    .withMessage('Format GTM-XXXXXXX attendu pour GTM ID'),
    
  body('analytics.gtmId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^GTM-[A-Za-z0-9]+$/.test(value.trim());
    })
    .withMessage('Format GTM-XXXXXXX attendu pour GTM ID'),
    
  // GA4 ID - NOTRE VALIDATION AMÉLIORÉE
  body('ga4Id')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^G-[A-Za-z0-9]+$/.test(value.trim());
    })
    .withMessage('Format G-XXXXXXX attendu pour GA4 ID'),
    
  body('analytics.ga4Id')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^G-[A-Za-z0-9]+$/.test(value.trim());
    })
    .withMessage('Format G-XXXXXXX attendu pour GA4 ID'),
    
  // Google Ads ID
  body('googleAdsId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^AW-[0-9]+$/.test(value.trim());
    })
    .withMessage('Format AW-XXXXXXX attendu pour Google Ads ID'),
    
  body('analytics.googleAdsId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^AW-[0-9]+$/.test(value.trim());
    })
    .withMessage('Format AW-XXXXXXX attendu pour Google Ads ID')
];

export const slugValidation = [
  param('slug')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug invalide')
];

export const platformValidation = [
  param('platform')
    .isIn(['spotify', 'appleMusic', 'youtube', 'deezer', 'amazonMusic', 'tidal'])
    .withMessage('Plateforme non supportée')
];