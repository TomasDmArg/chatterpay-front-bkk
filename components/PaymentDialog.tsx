import React from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Cashier } from '@/types/api';

interface PaymentDialogProps {
  /**
   * List of available cashiers to select from
   */
  cashiers: Cashier[];
  /**
   * Business ID to associate the payment with
   */
  businessId: string;
  /**
   * Function to call on successful payment creation
   */
  onSuccess?: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  cashiers,
  businessId,
  onSuccess,
}) => {
  const [amount, setAmount] = React.useState('');
  const [selectedCashier, setSelectedCashier] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Handles the form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCashier || !amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          cashier: selectedCashier,
          network: 'arbitrum-sepolia',
          currency: 'USDC',
          business: businessId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create payment');

      const data = await response.json();
      
      toast({
        title: 'Success',
        description: 'Payment created successfully',
      });

      // Reset form
      setAmount('');
      setSelectedCashier('');
      setOpen(false);
      
      // Call success callback if provided
      if (onSuccess) onSuccess();

      // Redirect to payment page
      router.push(`/payment/${data.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount (USDC)
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="cashier" className="text-sm font-medium">
              Select Cashier
            </label>
            <Select 
              value={selectedCashier}
              onValueChange={setSelectedCashier}
              disabled={loading}
            >
              <SelectTrigger id="cashier">
                <SelectValue placeholder="Select a cashier" />
              </SelectTrigger>
              <SelectContent>
                {cashiers.map((cashier) => (
                  <SelectItem key={cashier._id} value={cashier._id}>
                    {cashier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;