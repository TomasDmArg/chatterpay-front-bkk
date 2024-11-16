import { NextRequest, NextResponse } from 'next/server'
import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const transactionId = searchParams.get('transactionId')
    const userId = searchParams.get('userId')

    if (!transactionId || !userId) {
      return NextResponse.json(
        { error: 'Transaction ID and User ID are required' },
        { status: 400 }
      )
    }

    const client = initiateUserControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
    })

    // Get a new user token
    const tokenResponse = await client.createUserToken({
      userId
    })

    const response = await client.getTransaction({
      id: transactionId,
      userToken: tokenResponse.data?.userToken!
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting transaction status:', error)
    return NextResponse.json(
      { error: 'Failed to get transaction status' },
      { status: 500 }
    )
  }
}