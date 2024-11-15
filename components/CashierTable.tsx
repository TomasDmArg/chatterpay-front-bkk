import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Cashier } from "@/types/main";
import { CashierActions } from "./CashierActions";

interface CashiersTableProps {
  cashiers: Cashier[];
  onDelete: (id: number) => void;
}

export function CashiersTable({ cashiers, onDelete }: CashiersTableProps) {
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
          <TableRow key={cashier.id}>
            <TableCell className="font-medium">{cashier.name}</TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {cashier.status}
              </Badge>
            </TableCell>
            <TableCell>{cashier.transactions}</TableCell>
            <TableCell className="text-right">
              <CashierActions onDelete={onDelete} cashier={cashier} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}