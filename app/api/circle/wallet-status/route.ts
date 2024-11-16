import { NextRequest, NextResponse } from 'next/server'
import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const client = initiateUserControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!
    })

    const response = await client.listWallets({
      userId
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error getting wallet status:', error)
    return NextResponse.json({ error: 'Failed to get wallet status' }, { status: 500 })
  }
}
