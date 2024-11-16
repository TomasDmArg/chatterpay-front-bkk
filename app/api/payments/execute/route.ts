import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { ethers } from 'ethers';
import { verifyJWTToken } from '@/utils/jwt';
import paymentService from '@/services/paymentService';
import { createPaymentOrderCalldata } from '@/utils/payments';

const PAYMENT_PROCESSOR_ADDRESS = process.env.PAYMENT_PROCESSOR_ADDRESS;
const USDC_ADDRESS = process.env.USDC_ADDRESS;
const SIGNER_KEY = process.env.SIGNER_KEY;
const RPC_URL = process.env.RPC_URL;

/**
 * POST /api/payments/execute
 */
export async function POST(request: Request) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    // Verify JWT token
    try {
      verifyJWTToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Get payment details
    const paymentResponse = await paymentService.getPaymentOrderById(paymentId);
    const payment = paymentResponse.order;

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payment is not in pending status' },
        { status: 400 }
      );
    }

    // Create blockchain transaction
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(SIGNER_KEY!, provider);
    
    const calldata = createPaymentOrderCalldata(
      payment._id,
      USDC_ADDRESS!,
      ethers.utils.parseUnits(payment.amount.toString(), 6).toString()
    );

    // Send transaction
    const tx = await signer.sendTransaction({
      to: PAYMENT_PROCESSOR_ADDRESS,
      data: calldata,
      gasLimit: 500000, // Optional: Adjust based on your needs
    });

    // Wait for transaction confirmation
    await tx.wait();

    // Update payment status
    const updatedPayment = await paymentService.updatePaymentOrder(paymentId, {
      status: 'completed',
      transactionHash: tx.hash
    });

    return NextResponse.json({
      status: 'success',
      data: {
        message: 'Payment executed successfully',
        payment: updatedPayment.order,
        transaction: {
          hash: tx.hash,
          blockNumber: tx.blockNumber,
        }
      }
    });

  } catch (error) {
    console.error('Error executing payment:', error);
    
    // If there was a transaction attempt, mark payment as failed
    if (error instanceof Error && 'paymentId' in error) {
      try {
        await paymentService.updatePaymentOrder(error['paymentId'] as string, {
          status: 'failed',
        });
      } catch (updateError) {
        console.error('Error updating failed payment:', updateError);
      }
    }

    return NextResponse.json(
      { error: 'Failed to execute payment' },
      { status: 500 }
    );
  }
}