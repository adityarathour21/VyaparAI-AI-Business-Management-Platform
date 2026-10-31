import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * AuditLog Mongoose Schema
 * Tracks all critical and sensitive store actions (product deletion, invoice voiding,
 * manual stock overrides, cashier refunds, and financial adjustments).
 */
const AuditLogSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    targetId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true
    },
    details: {
      type: Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for tenant-scoped querying and audit exports
AuditLogSchema.index({ businessId: 1, timestamp: -1 });
AuditLogSchema.index({ businessId: 1, action: 1, timestamp: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

export default AuditLog;
