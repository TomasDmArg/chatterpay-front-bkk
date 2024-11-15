import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Transaction } from "@/types/main";

interface TransactionsTableProps {
  transactions: Transaction[];
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
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">{transaction.transactionId}</TableCell>
            <TableCell>{transaction.cashier}</TableCell>
            <TableCell>
              <Badge variant={transaction.type === 'Sale' ? 'default' : 'secondary'}>
                {transaction.type}
              </Badge>
            </TableCell>
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
            <TableCell>{transaction.timestamp}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}