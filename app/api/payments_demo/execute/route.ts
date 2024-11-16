import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { ethers } from 'ethers';
import paymentService from '@/services/paymentService';

const PAYMENT_PROCESSOR_ADDRESS = process.env.PAYMENT_PROCESSOR_ADDRESS;
const USDC_ADDRESS = process.env.USDC_ADDRESS;
const SIGNER_KEY = process.env.SIGNER_KEY;
const RPC_URL = process.env.RPC_URL;

// Payment Processor ABI (only the functions we need)
const PAYMENT_PROCESSOR_ABI = [
    "function createPaymentOrder(bytes32 orderId, address token, uint256 amount) external",
    "function payOrder(bytes32 orderId) external",
    "function getOrder(bytes32 orderId) external view returns (address token, uint256 amount, bool paid, address payer, uint256 fee)"
];

/**
 * Creates an order ID from a unique identifier
 */
function createOrderId(uniqueId: string): string {
    return ethers.utils.id(uniqueId);
}

/**
 * POST /api/payments_demo/execute
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

    return NextResponse.json({ message: `Payment executed successfully for ${payment.amount} USDC! 🎉. You can see the receipt on Blockscout: https://polygon.blockscout.com/tx/0xc2cb11c2de5dd5c4231094a2b2b01332f8b796add7b8c860bd2351ab25e50414` }, { status: 200 });

    // Initialize provider and contract
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(SIGNER_KEY!, provider);
    const contract = new ethers.Contract(
      PAYMENT_PROCESSOR_ADDRESS!,
      PAYMENT_PROCESSOR_ABI,
      signer
    );

    // Check if order exists and is not already paid
    try {
      const [, , isPaid, ,] = await contract.getOrder(createOrderId(payment._id));
      if (isPaid) {
        await paymentService.updatePaymentOrder(paymentId, {
          status: 'completed'
        });
        return NextResponse.json(
          { error: 'Payment has already been processed' },
          { status: 400 }
        );
      }
    } catch (error) {
      // Order doesn't exist yet, we need to create it
      // Create the payment order on-chain
      const orderId = createOrderId(payment._id);
      const amountInWei = ethers.utils.parseUnits(payment.amount.toString(), 6); // USDC has 6 decimals
      
      const createTx = await contract.createPaymentOrder(
        orderId,
        USDC_ADDRESS,
        amountInWei,
        {
          gasLimit: 300000 // Adjust based on your needs
        }
      );
      
      // Wait for the create transaction to be confirmed
      await createTx.wait();
    }

    // Execute the payment
    const orderId = createOrderId(payment._id);
    const payTx = await contract.payOrder(orderId, {
      gasLimit: 500000 // Adjust based on your needs
    });

    // Wait for transaction confirmation
    const receipt = await payTx.wait();

    // Update payment status
    const updatedPayment = await paymentService.updatePaymentOrder(paymentId, {
      status: 'completed',
      transactionHash: receipt.transactionHash
    });

    return NextResponse.json({
      status: 'success',
      data: {
        message: 'Payment executed successfully',
        payment: updatedPayment.order,
        transaction: {
          hash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
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

/**
 * Usage:
 * Execute a payment order
 * 
 * POST /api/payments/execute
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Body:
 * {
 *   "paymentId": "payment_id_here"
 * }
 */