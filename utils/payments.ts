/**
 * Utility functions for handling payments
 */

import { ethers } from 'ethers';
import type { PaymentOrder } from '@/types/api';

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Payment creation parameters interface
 */
interface CreatePaymentParams {
  amount: number;
  cashierId: string;
  businessId: string;
  network?: string;
  currency?: string;
}

/**
 * Creates a unique payment identifier
 */
export function createPaymentId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats the amount with proper decimals for blockchain
 */
export function formatAmount(amount: number): string {
  return ethers.utils.parseUnits(amount.toString(), 6).toString(); // 6 decimals for USDC
}

/**
 * Creates a new payment order
 */
export async function createPayment({
  amount,
  cashierId,
  businessId,
  network = 'arbitrum-sepolia',
  currency = 'USDC'
}: CreatePaymentParams): Promise<PaymentOrder> {
  // Format the payment data
  const paymentData = {
    amount,
    network,
    currency,
    cashier: cashierId,
    business: businessId,
    status: PaymentStatus.PENDING,
    uniqueId: createPaymentId(),
  };

  // Make API call to create payment
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment');
  }

  return response.json();
}

/**
 * Gets payment details by ID
 */
export async function getPaymentById(id: string): Promise<PaymentOrder> {
  const response = await fetch(`/api/payments/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch payment');
  }

  return response.json();
}

/**
 * Updates payment status
 */
export async function updatePaymentStatus(
  id: string, 
  status: PaymentStatus,
  transactionHash?: string
): Promise<PaymentOrder> {
  const response = await fetch(`/api/payments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, transactionHash }),
  });

  if (!response.ok) {
    throw new Error('Failed to update payment status');
  }

  return response.json();
}

/**
 * Gets the payment URL for a given payment ID
 */
export function getPaymentUrl(paymentId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/payment/${paymentId}`;
}