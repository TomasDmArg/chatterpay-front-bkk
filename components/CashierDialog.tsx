import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface CashierDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  newCashierName: string;
  setNewCashierName: (name: string) => void;
}

export function CashierDialog({ isOpen, onOpenChange, onSubmit, newCashierName, setNewCashierName }: CashierDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Cashier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Cashier</DialogTitle>
          <DialogDescription>Enter the details of the new cashier.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cashierName" className="text-right">Name</Label>
            <Input
              id="cashierName"
              value={newCashierName}
              onChange={(e) => setNewCashierName(e.target.value)}
              className="col-span-3"
              placeholder="Enter cashier name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit}>Add Cashier</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}