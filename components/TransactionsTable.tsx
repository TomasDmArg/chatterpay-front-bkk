import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { PaymentOrder } from "@/types/api";

interface TransactionsTableProps {
  transactions: PaymentOrder[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction ID</TableHead>
          <TableHead>Cashier</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction._id}>
            <TableCell className="font-medium">{transaction._id}</TableCell>
            <TableCell>{transaction.cashier.name}</TableCell>
            <TableCell>${transaction.amount.toFixed(2)}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  transaction.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {transaction.status}
              </Badge>
            </TableCell>
            <TableCell>{new Date(transaction.createdAt).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}