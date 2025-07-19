import { Router } from 'express';
import axios from 'axios';
import { body, validationResult } from 'express-validator';

const router = Router();

router.post('/scan',
  body('url').isURL().withMessage('URL invalide'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: errors.array() 
      });
    }

    try {
      const { url } = req.body;
      
      // Call Odesli API
      const { data } = await axios.get('https://api.song.link/v1-alpha.1/links', {
        params: { 
          url, 
          userCountry: 'US',
          platform: 'spotify' 
        }
      });

      // Extract song information
      const entities = Object.values(data.entitiesByUniqueId || {});
      const song = entities.find(e => e.type === 'song');
      
      if (!song) {
        return res.status(404).json({ 
          error: 'Lien non trouvé. Veuillez vérifier l\'URL ou utiliser un ISRC/UPC valide.' 
        });
      }

      // Extract platform links
      const links = {};
      Object.entries(data.linksByPlatform || {}).forEach(([platform, { url }]) => {
        // Map platform names to our standard format
        const platformMap = {
          'spotify': 'spotify',
          'appleMusic': 'appleMusic',
          'youtube': 'youtube',
          'youtubeMusic': 'youtube',
          'deezer': 'deezer',
          'amazonMusic': 'amazonMusic',
          'tidal': 'tidal'
        };
        
        const mappedPlatform = platformMap[platform] || platform;
        links[mappedPlatform] = url;
      });

      res.status(200).json({
        artist: song.artistName,
        title: song.title,
        thumbnailUrl: song.thumbnailUrl,
        links
      });
      
    } catch (error) {
      console.error('Scan error:', error.message);
      
      if (error.response?.status === 404) {
        return res.status(404).json({ 
          error: 'Lien non trouvé. Veuillez vérifier l\'URL ou utiliser un ISRC/UPC valide.' 
        });
      }
      
      res.status(500).json({ 
        error: 'Erreur interne du serveur' 
      });
    }
  }
);

export default router;