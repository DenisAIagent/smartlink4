import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index.js';
import SmartLink from '../src/models/SmartLink.js';

// Test database
const MONGODB_URI = 'mongodb://127.0.0.1:27017/smartlink-test';

beforeAll(async () => {
  await mongoose.connect(MONGODB_URI);
  await SmartLink.deleteMany({});
});

afterAll(async () => {
  await SmartLink.deleteMany({});
  await mongoose.connection.close();
});

describe('SmartLink API', () => {
  const testLink = {
    artist: 'Test Artist',
    title: 'Test Song',
    slug: 'test-song',
    coverUrl: 'https://example.com/cover.jpg',
    streamingLinks: {
      spotify: 'https://open.spotify.com/track/test',
      appleMusic: 'https://music.apple.com/track/test'
    },
    analytics: {
      gtmId: 'GTM-572GXWPP', // Notre validation GTM améliorée
      ga4Id: 'G-123ABC456'
    }
  };

  describe('POST /api/links', () => {
    it('should create a new SmartLink with valid data', async () => {
      const response = await request(app)
        .post('/api/links')
        .send(testLink)
        .expect(201);

      expect(response.body).toMatchObject({
        artist: testLink.artist,
        title: testLink.title,
        slug: testLink.slug
      });
      expect(response.body._id).toBeDefined();
    });

    it('should reject duplicate slugs', async () => {
      await request(app)
        .post('/api/links')
        .send({ ...testLink, slug: 'duplicate-test' })
        .expect(201);

      const response = await request(app)
        .post('/api/links')
        .send({ ...testLink, slug: 'duplicate-test' })
        .expect(409);

      expect(response.body.error).toBe('This slug is already in use.');
    });

    it('should accept mixed case GTM IDs', async () => {
      const response = await request(app)
        .post('/api/links')
        .send({
          ...testLink,
          slug: 'gtm-test',
          analytics: { gtmId: 'GTM-572GXWPP' }
        })
        .expect(201);

      expect(response.body.analytics.gtmId).toBe('GTM-572GXWPP');
    });

    it('should reject invalid GTM IDs', async () => {
      const response = await request(app)
        .post('/api/links')
        .send({
          ...testLink,
          slug: 'invalid-gtm',
          analytics: { gtmId: 'INVALID-ID' }
        })
        .expect(400);

      expect(response.body.error).toBe('Données invalides');
    });
  });

  describe('GET /api/links/:slug', () => {
    it('should get a SmartLink by slug', async () => {
      const response = await request(app)
        .get('/api/links/test-song')
        .expect(200);

      expect(response.body.slug).toBe('test-song');
      expect(response.body.artist).toBe('Test Artist');
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app)
        .get('/api/links/non-existent')
        .expect(404);

      expect(response.body.error).toBe('SmartLink non trouvé');
    });
  });

  describe('GET /api/redirect/:slug/:platform', () => {
    it('should redirect to platform and track click', async () => {
      const response = await request(app)
        .get('/api/redirect/test-song/spotify')
        .expect(302);

      expect(response.headers.location).toBe('https://open.spotify.com/track/test');

      // Verify click was tracked
      const link = await SmartLink.findOne({ slug: 'test-song' });
      expect(link.clickStats.totalViews).toBeGreaterThan(0);
      expect(link.clickStats.clicks.get('spotify')).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent platform', async () => {
      await request(app)
        .get('/api/redirect/test-song/non-existent-platform')
        .expect(404);
    });
  });

  describe('Health check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});