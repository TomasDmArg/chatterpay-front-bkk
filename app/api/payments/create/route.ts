import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import paymentService from '@/services/paymentService';
import cashierService from '@/services/cashierService';
import { verifyJWTToken } from '@/utils/jwt';
import { createOrder } from '@/utils/payments';

/**
 * POST /api/payments/create
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
    const { 
      amount, 
      cashierId, 
      currency = 'USDC', 
      network = 'polygon' 
    } = body;

    // Validate required fields
    if (!amount || !cashierId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get cashier details
    const cashierResponse = await cashierService.getCashierById(cashierId);
    const cashier = cashierResponse.cashier;

    if (!cashier) {
      return NextResponse.json(
        { error: 'Cashier not found' },
        { status: 404 }
      );
    }

    // Get pending payments
    const paymentsResponse = await paymentService.getAllPaymentOrders();
    const pendingPayments = paymentsResponse.orders.filter(
      order => order.cashier._id === cashierId && order.status === 'pending'
    );

    // Check pending payments limit
    if (pendingPayments.length >= 10) {
      return NextResponse.json(
        { error: 'Maximum pending payments limit reached for this cashier' },
        { status: 400 }
      );
    }

    // Generate unique payment ID
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create payment order
    const paymentData = {
      amount: parseFloat(amount),
      cashier: cashierId,
      network,
      currency,
      status: 'pending' as 'pending',
      uniqueId,
    };

    const response = await paymentService.createPaymentOrder(paymentData);

    createOrder({
        amount,
        channel_user_id: "5492233049354",
        order_id: uniqueId,
        token_address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    })
    
    return NextResponse.json({
      status: 'success',
      data: {
        message: 'Payment created successfully',
        payment: response.order,
      }
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

/**
 * Usage:
 * Create a new payment order
 * 
 * POST /api/payments/create
 * 
 * Headers:
 * Authorization
 * 
 * Body:
 * {
 *  "amount": 100,
 *  "cashierId": "60f7b3b3b3b3b3b3b3b3b3b3",
 *  "currency": "USDC",
 *  "network": "polygon"
 * }
 * 
 */