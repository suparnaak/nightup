import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITransaction {
  _id?: Types.ObjectId; 
  type: "credit" | "debit";
  amount: number;
  description?: string;
  paymentId?: string; 
  date: Date;
}

export interface IWallet extends Document {
    _id: Types.ObjectId;
  user: Types.ObjectId;
  balance: number;
  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema: Schema = new Schema({
  type: { type: String, enum: ["credit", "debit"], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  paymentId: { type: String }, 
  date: { type: Date, default: Date.now },
});

const walletSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>("Wallet", walletSchema);
