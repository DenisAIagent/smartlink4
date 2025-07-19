import { Router } from 'express';
import SmartLink from '../models/SmartLink.js';
import { slugValidation, platformValidation } from '../validators/linkValidators.js';

const router = Router();

// Redirect to platform and track click
router.get('/redirect/:slug/:platform', [slugValidation, platformValidation], async (req, res) => {
  try {
    const { slug, platform } = req.params;
    
    // Find the SmartLink
    const link = await SmartLink.findOne({ slug });
    if (!link) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SmartLink non trouvé</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 2rem; }
            .error { max-width: 400px; margin: 0 auto; }
            h1 { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>🔗 SmartLink non trouvé</h1>
            <p>Le lien que vous cherchez n'existe pas ou a été supprimé.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Check if platform exists in streamingLinks
    const destination = link.streamingLinks.get(platform);
    if (!destination) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Plateforme non disponible</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 2rem; }
            .error { max-width: 400px; margin: 0 auto; }
            h1 { color: #f59e0b; }
            .back-link { color: #3b82f6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>🎵 Plateforme non disponible</h1>
            <p>Ce morceau n'est pas disponible sur ${platform}.</p>
            <a href="/${slug}" class="back-link">← Retour aux autres plateformes</a>
          </div>
        </body>
        </html>
      `);
    }

    // Track the click - Update analytics
    try {
      await SmartLink.updateOne(
        { slug },
        { 
          $inc: { 
            'clickStats.totalViews': 1,
            [`clickStats.clicks.${platform}`]: 1
          }
        }
      );
    } catch (trackingError) {
      console.error('Analytics tracking error:', trackingError.message);
      // Don't fail the redirect if tracking fails
    }

    // Perform the redirect
    res.redirect(302, destination);
    
  } catch (error) {
    console.error('Redirect error:', error.message);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erreur serveur</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 2rem; }
          .error { max-width: 400px; margin: 0 auto; }
          h1 { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>⚠️ Erreur serveur</h1>
          <p>Une erreur s'est produite. Veuillez réessayer plus tard.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Analytics endpoint - Get click stats for a SmartLink
router.get('/analytics/:slug', slugValidation, async (req, res) => {
  try {
    const { slug } = req.params;
    
    const link = await SmartLink.findOne({ slug })
      .select('artist title slug clickStats createdAt')
      .lean();
    
    if (!link) {
      return res.status(404).json({ 
        error: 'SmartLink non trouvé' 
      });
    }

    // Transform clicks Map to object for JSON response
    const clicksData = {};
    if (link.clickStats.clicks) {
      for (const [platform, count] of link.clickStats.clicks) {
        clicksData[platform] = count;
      }
    }

    res.json({
      slug: link.slug,
      artist: link.artist,
      title: link.title,
      totalViews: link.clickStats.totalViews,
      clicksByPlatform: clicksData,
      createdAt: link.createdAt
    });
    
  } catch (error) {
    console.error('Analytics error:', error.message);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
});

export default router;