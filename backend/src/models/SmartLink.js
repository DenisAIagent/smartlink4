import mongoose from 'mongoose';

const SmartLinkSchema = new mongoose.Schema({
  artist: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  },
  coverUrl: {
    type: String,
    required: false,
    default: 'https://via.placeholder.com/300x300/6366f1/ffffff?text=Cover'
  },
  streamingLinks: {
    type: Object,
    required: false,
    default: () => ({})
  },
  analytics: {
    gtmId: String,
    ga4Id: String,
    googleAdsId: String
  },
  clickStats: {
    totalViews: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Object,
      default: () => ({})
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to ensure slug is lowercase and trimmed
SmartLinkSchema.pre('save', function(next) {
  if (this.slug) {
    this.slug = this.slug.toLowerCase().trim();
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('SmartLink', SmartLinkSchema);