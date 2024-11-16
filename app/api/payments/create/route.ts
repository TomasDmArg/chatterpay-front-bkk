import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import paymentService from '@/services/paymentService';
import cashierService from '@/services/cashierService';
import { verifyJWTToken } from '@/utils/jwt';

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

    try {
      verifyJWTToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
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