import mongoose, { Schema, Document } from 'mongoose';

export interface IContactRequest extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  requestType: 'contact' | 'booking' | 'test_ride' | 'service';
  status: 'new' | 'read' | 'replied' | 'closed';
  adminNote?: string;
  adminReplyTime?: Date;       // When admin said they'd call/meet
  adminReplyLocation?: string; // Where (showroom, online, etc.)
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactRequestSchema = new Schema<IContactRequest>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    requestType: {
      type: String,
      enum: ['contact', 'booking', 'test_ride', 'service'],
      default: 'contact',
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'closed'],
      default: 'new',
    },
    adminNote: { type: String, trim: true },
    adminReplyTime: { type: Date },
    adminReplyLocation: { type: String, trim: true },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export const ContactRequest = mongoose.model<IContactRequest>('ContactRequest', ContactRequestSchema);
