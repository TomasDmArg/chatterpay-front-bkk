'use client';

import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users2, Receipt, Building2, LogOut } from 'lucide-react';
import { CashierDialog } from '@/components/CashierDialog';
import { TransactionsTable } from '@/components/TransactionsTable';
import { CashiersTable } from '@/components/CashierTable';
import Avvvatars from 'avvvatars-react'
import { useAuth, withAuth } from '@/context/user';
import businessService from '@/services/businessService';
import paymentService from '@/services/paymentService';
import cashierService from '@/services/cashierService';
import { 
  Business, 
  Cashier, 
  PaymentOrder,
  BusinessListData,
  PaymentOrderListData,
  CashierListData,
  SingleCashierData
} from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import PaymentDialog from '@/components/PaymentDialog';

function DashboardPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [business, setBusiness] = useState<Business | null>(null);
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [transactions, setTransactions] = useState<PaymentOrder[]>([]);
  const [newCashierName, setNewCashierName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const router = useRouter();

  const addCashier = () => {
    if (newCashierName.trim()) {
      cashierService.createCashier({
        name: newCashierName,
        business: business?._id || '',
        active: true,
        uniqueId: Math.random().toString(36).substr(2, 9)
      }).then((cashier: SingleCashierData) => {
        setCashiers(prev => [...prev, cashier.cashier]);
        setNewCashierName('');
        setIsDialogOpen(false);
      }).catch(error => {
        console.error('Error creating cashier:', error);
        toast({
          title: 'Error',
          description: 'Failed to create cashier',
          variant: 'destructive'
        });
      })
      setIsDialogOpen(false);
    }
  };

  const deleteCashier = async (id: string) => {
    try {
      await cashierService.deleteCashier(id);
      setCashiers(prev => prev.filter(cashier => cashier._id !== id));
    } catch (error) {
      console.error('Error deleting cashier:', error);
    }
  };

  const handleEditBusiness = ()=> {
    router.push('/edit-business');
  }

  const handlePaymentSuccess = () => {
    toast({
      title: 'Success',
      description: 'Payment successful',
      variant: 'default'
    })
  }

  const fetchData = useCallback(async () => {
    try {
      const promises = [
        businessService.getAllBusinesses(),
        paymentService.getAllPaymentOrders(),
        cashierService.getAllCashiers()
      ];

      const [businessesData, paymentsData, cashiersData] = await Promise.all(promises) as [
        BusinessListData,
        PaymentOrderListData,
        CashierListData
      ];

      console.log(businessesData);
      
      const myBusiness = businessesData.businesses.find(bs => bs.owner === user?.id);
      
      if (myBusiness) {
        const myPaymentOrders = paymentsData.orders.filter(
          order => order.cashier.business === myBusiness._id
        );
        const myCashiers = cashiersData.cashiers.filter(
          cashier => cashier.business === myBusiness._id
        );

        setBusiness(myBusiness);
        setCashiers(myCashiers);
        setTransactions(myPaymentOrders);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [user]);

  React.useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData, user]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >

        <h1 className="text-4xl font-bold tracking-tight flex flex-row items-center gap-3">
            <div className='hidden md:flex'>
              <Avvvatars value="myStore" size={50} style='shape' />
            </div>
            {business?.name}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
        
      </motion.div>
      
      <div className="flex justify-start items-center gap-4">
        <PaymentDialog 
          cashiers={cashiers}
          businessId={business?._id!}
          onSuccess={handlePaymentSuccess}
        />
        <Button variant="secondary" onClick={handleEditBusiness}>
          <Building2 className="mr-2 h-4 w-4" />
          Edit Business
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users2 className="h-5 w-5 text-primary" />
              <CardTitle>Cashiers</CardTitle>
            </div>
            <CashierDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onSubmit={addCashier}
              newCashierName={newCashierName}
              setNewCashierName={setNewCashierName}
            />
          </CardHeader>
          <CardContent>
            <CashiersTable cashiers={cashiers} onDelete={deleteCashier} payments={transactions} business={business} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-primary" />
              <CardTitle>Transaction History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionsTable transactions={transactions} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default withAuth(DashboardPage);