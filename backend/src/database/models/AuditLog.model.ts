import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  entity: string;     // e.g. 'Product', 'Order'
  entityId?: string;
  performedBy: mongoose.Types.ObjectId;
  performedByRole: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: String,
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  performedByRole: { type: String, required: true },
  ipAddress: String,
  userAgent: String,
  changes: {
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
  },
  metadata: Schema.Types.Mixed,
}, { timestamps: { createdAt: true, updatedAt: false } });

auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
export { AuditLog };
