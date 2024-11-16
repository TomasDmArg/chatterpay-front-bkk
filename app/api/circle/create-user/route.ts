import { NextRequest, NextResponse } from 'next/server'
import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets'

export async function POST(req: NextRequest) {
  try {
    console.log('Starting wallet creation process...')
    const { email } = await req.json()
    console.log(`Received request for email: ${email}`)

    // Crear un userId basado en el email para hacerlo idempotente
    // Así si el mismo email intenta crear una wallet, usará el mismo ID
    const userId = crypto.randomUUID();
    console.log(`Generated userId: ${userId}`)

    // Initialize Circle client
    console.log('Initializing Circle client...')
    const client = initiateUserControlledWalletsClient({
      apiKey: process.env?.CIRCLE_API_KEY ?? "",
    })
    console.log('Circle client initialized successfully')

    // Crear usuario (esto es idempotente, si ya existe no hay problema)
    console.log('Creating Circle user...')
    await client.createUser({
      userId
    })
    console.log('Circle user created successfully')

    // Get user token
    console.log('Requesting user token...')
    const tokenResponse = await client.createUserToken({
      userId
    })
    console.log('User token obtained successfully')

    // Initialize PIN
    console.log('Initializing user PIN...')
    const pinResponse = await client.createUserPin({
      userToken: tokenResponse.data?.userToken!
    })
    console.log('PIN initialization successful')

    // Wait for PIN challenge to complete before creating wallet
    console.log('Creating user wallet with PIN verification...')
    await client.createUserPinWithWallets({
      userToken: tokenResponse.data?.userToken!,
      blockchains: ['ARB-SEPOLIA']
    })

    console.log('Wallet created successfully')

    console.log('Preparing response data...')
    const responseData = {
      data: {
        userToken: tokenResponse.data?.userToken,
        encryptionKey: tokenResponse.data?.encryptionKey,
        challengeId: pinResponse.data?.challengeId!,
        userId
      }
    }
    console.log('Wallet creation process completed successfully')

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error in Circle operations while creating wallet:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available')
    return NextResponse.json(
      { error: 'Failed to setup Circle wallet' },
      { status: 500 }
    )
  }
}