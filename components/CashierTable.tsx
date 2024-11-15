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
            <TableCell className="font-medium py-2">{cashier.name}</TableCell>
            <TableCell className="py-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {cashier.status}
              </Badge>
            </TableCell>
            <TableCell className="py-2">{cashier.transactions}</TableCell>
            <TableCell className="text-right py-2">
              <CashierActions onDelete={onDelete} cashier={cashier} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}