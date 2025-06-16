export interface Transaction {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  description?: string;
  paymentId?: string;
  date: string;
}

export interface Wallet {
  balance: number;
  transactions: Transaction[];
}
