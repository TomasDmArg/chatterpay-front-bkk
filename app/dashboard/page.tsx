'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users2, Receipt, Building2, LogOut } from 'lucide-react';
import { CashierDialog } from '@/components/CashierDialog';
import { TransactionsTable } from '@/components/TransactionsTable';
import { Cashier, Transaction } from '@/types/main';
import { CashiersTable } from '@/components/CashierTable';
import Avvvatars from 'avvvatars-react'

export default function DashboardPage() {
  const [cashiers, setCashiers] = useState<Cashier[]>([
    { id: 1, name: 'John Doe', status: 'Active', transactions: 145 },
    { id: 2, name: 'Jane Smith', status: 'Active', transactions: 89 },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      id: 1, 
      cashier: 'John Doe', 
      amount: 50.00,
      status: 'completed',
      timestamp: '2024-03-15 14:30',
      transactionId: '#TRX-001',
      type: 'Sale'
    },
    { 
      id: 2, 
      cashier: 'Jane Smith', 
      amount: 30.00,
      status: 'pending',
      timestamp: '2024-03-15 15:45',
      transactionId: '#TRX-002',
      type: 'Refund'
    },
  ]);

  const [newCashierName, setNewCashierName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addCashier = () => {
    if (newCashierName.trim()) {
      setCashiers([
        ...cashiers, 
        { 
          id: cashiers.length + 1, 
          name: newCashierName.trim(),
          status: 'Active',
          transactions: 0
        }
      ]);
      setNewCashierName('');
      setIsDialogOpen(false);
    }
  };

  const deleteCashier = (id: number) => {
    setCashiers(prev => prev.filter(cashier => cashier.id !== id));
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >

        <h1 className="text-4xl font-bold tracking-tight flex flex-row items-center gap-3">
            <Avvvatars value="myStore" size={50} style='shape' />
            My Store
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => window.location.href = '/edit-business'}>
            <Building2 className="mr-2 h-4 w-4" />
            Edit Business
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
        
      </motion.div>

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
            <CashiersTable cashiers={cashiers} onDelete={deleteCashier}/>
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