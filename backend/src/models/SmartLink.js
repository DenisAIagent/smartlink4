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
    required: true
  },
  streamingLinks: {
    type: Map,
    of: String,
    required: true
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
      type: Map,
      of: Number,
      default: {}
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