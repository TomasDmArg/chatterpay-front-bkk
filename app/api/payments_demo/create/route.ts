import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { ethers } from 'ethers';
import paymentService from '@/services/paymentService';
import cashierService from '@/services/cashierService';
import { verifyJWTToken } from '@/utils/jwt';
import { createOrder } from '@/utils/paymentsDemo';

// Add your RPC URL and private key
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

/**
 * POST /api/payments_demo/create
 */
export async function POST(request: Request) {
  const headersList = headers();
  const token = headersList.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json(
      { error: 'Missing authorization token' },
      { status: 401 }
    );
  }

  return NextResponse.json({ message: `You paid USDC successfully! 🎉. You can see the receipt on Blockscout: https://polygon.blockscout.com/tx/0xc2cb11c2de5dd5c4231094a2b2b01332f8b796add7b8c860bd2351ab25e50414` }, { status: 200 });
}

/**
 * Usage:
 * Create a new payment order
 * 
 * POST /api/payments/create
 * 
 * Headers:
 * Authorization: Bearer <token>
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