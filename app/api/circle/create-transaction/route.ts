import { NextRequest, NextResponse } from 'next/server'
import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets'

/**
 * Creates a new transaction and returns challenge data
 */
export async function POST(req: NextRequest) {
  try {
    const { 
      userId,
      amount,
      destinationAddress, 
      tokenId,
      walletId 
    } = await req.json()

    const client = initiateUserControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
    })

    // Get user token for transaction
    const tokenResponse = await client.createUserToken({
      userId
    })

    // Create transaction
    const response = await client.createTransaction({
      userId,
      amounts: [amount.toString()],
      destinationAddress,
      tokenId,
      walletId,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM'
        }
      }
    })

    return NextResponse.json({
      challengeId: response.data?.challengeId!,
      userToken: tokenResponse.data?.userToken!,
      encryptionKey: tokenResponse.data?.encryptionKey!
    })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
