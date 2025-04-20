import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IChatMessage extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderType: 'user' | 'host';
  receiverId: Types.ObjectId;
  receiverType: 'user' | 'host';
  content: string;
  isRead: boolean;
  timestamp: Date;
}



const chatMessageSchema = new Schema<IChatMessage>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'host'],
    required: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  receiverType: {
    type: String,
    enum: ['user', 'host'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default model('ChatMessage', chatMessageSchema);