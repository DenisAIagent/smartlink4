import { Router } from 'express';
import { validationResult } from 'express-validator';
import SmartLink from '../models/SmartLink.js';
import { createLinkValidation, slugValidation } from '../validators/linkValidators.js';
import { normalizeSmartLinkData } from '../middleware/normalizeData.js';

const router = Router();

// Create a new SmartLink
router.post('/links', normalizeSmartLinkData, createLinkValidation, async (req, res) => {
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ 
        error: 'Données invalides',
        details: errors.array() 
      });
    }

    const { slug } = req.body;
    
    // Check slug uniqueness
    const existingLink = await SmartLink.findOne({ slug });
    if (existingLink) {
      return res.status(409).json({ 
        error: 'This slug is already in use.' 
      });
    }

    // Create the SmartLink
    const link = await SmartLink.create(req.body);
    res.status(201).json(link);
    
  } catch (error) {
    console.error('Create link error:', error.message);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
});

// Get all SmartLinks
router.get('/links', async (req, res) => {
  try {
    const links = await SmartLink.find()
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(links);
  } catch (error) {
    console.error('Get links error:', error.message);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
});

// Get a specific SmartLink by slug
router.get('/links/:slug', slugValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Slug invalide',
        details: errors.array() 
      });
    }

    const { slug } = req.params;
    const link = await SmartLink.findOne({ slug }).lean();
    
    if (!link) {
      return res.status(404).json({ 
        error: 'SmartLink non trouvé' 
      });
    }

    res.json(link);
  } catch (error) {
    console.error('Get link error:', error.message);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
});

// Check slug availability
router.get('/links/check-slug/:slug', slugValidation, async (req, res) => {
  try {
    const { slug } = req.params;
    const exists = await SmartLink.findOne({ slug });
    
    res.json({ 
      available: !exists,
      slug 
    });
  } catch (error) {
    console.error('Check slug error:', error.message);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
});

// Update a SmartLink
router.put('/links/:slug', [slugValidation, ...createLinkValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: errors.array() 
      });
    }

    const { slug } = req.params;
    const updateData = { ...req.body, updatedAt: Date.now() };
    
    const link = await SmartLink.findOneAndUpdate(
      { slug },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!link) {
      return res.status(404).json({ 
        error: 'SmartLink non trouvé' 
      });
    }

    res.json(link);
  } catch (error) {
    console.error('Update link error:', error.message);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
});

// Delete a SmartLink
router.delete('/links/:slug', slugValidation, async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await SmartLink.findOneAndDelete({ slug });
    
    if (!link) {
      return res.status(404).json({ 
        error: 'SmartLink non trouvé' 
      });
    }

    res.json({ 
      message: 'SmartLink supprimé avec succès',
      slug 
    });
  } catch (error) {
    console.error('Delete link error:', error.message);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
});

export default router;