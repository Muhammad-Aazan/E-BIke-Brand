import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IWebhookEvent extends Document {
  provider: string;
  eventId: string;  // provider event ID - unique
  eventType: string;
  payload: Record<string, unknown>;
  status: 'received' | 'processed' | 'failed' | 'ignored';
  processingError?: string;
  processedAt?: Date;
  createdAt: Date;
}

const webhookEventSchema = new Schema<IWebhookEvent>({
  provider: { type: String, required: true },
  eventId: { type: String, required: true },
  eventType: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: ['received', 'processed', 'failed', 'ignored'],
    default: 'received',
  },
  processingError: String,
  processedAt: Date,
}, { timestamps: { createdAt: true, updatedAt: false } });

// Unique constraint: prevents duplicate processing
webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });
webhookEventSchema.index({ status: 1, createdAt: -1 });
// TTL: auto-delete processed events after 90 days
webhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const WebhookEvent: Model<IWebhookEvent> = mongoose.model<IWebhookEvent>('WebhookEvent', webhookEventSchema);
export { WebhookEvent };
