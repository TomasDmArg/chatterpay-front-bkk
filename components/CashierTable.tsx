import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Business, Cashier, PaymentOrder, PaymentOrderListData } from "@/types/api";
import { CashierActions } from "./CashierActions";
import { useMemo } from "react";

interface CashiersTableProps {
  cashiers: Cashier[];
  payments: PaymentOrder[];
  business: Business | null;
  onDelete: (id: string) => void;
}

export function CashiersTable({ cashiers, payments, business, onDelete }: CashiersTableProps) {
  //Find all payments amount for each cashier (paymentOrder.cashier)
  const cashiersWithTransactions = useMemo(() => {
    return cashiers.map((cashier) => {
      const transactions = payments.filter((payment) => payment.cashier._id === cashier._id);
      return {
        ...cashier,
        transactions: transactions.length,
      };
    });
  }, [cashiers, payments]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Transactions</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cashiers.map((cashier) => (
          <TableRow key={cashier._id}>
            <TableCell className="font-medium py-2">{cashier.name}</TableCell>
            <TableCell className="py-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {cashier.active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="py-2">
              {cashiersWithTransactions.find((c) => c._id === cashier._id)?.transactions || 0}
            </TableCell>
            <TableCell className="text-right py-2">
              <CashierActions onDelete={onDelete} cashier={cashier} businessName={business?.name!} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}