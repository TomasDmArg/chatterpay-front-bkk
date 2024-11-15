export interface Cashier {
    id: number;
    name: string;
    status: string;
    transactions: number;
}
  
export interface Transaction {
    id: number;
    cashier: string;
    amount: number;
    status: string;
    timestamp: string;
    transactionId: string;
    type: string;
}