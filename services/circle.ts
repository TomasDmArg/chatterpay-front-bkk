// services/circle/index.ts
'use client'

import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk'

interface CircleResponse {
  data: {
    userToken: string
    encryptionKey: string
    challengeId: string
    userId: string
  }
}

interface CreateUserResponse {
  userId: string
  userToken: string
  encryptionKey: string
  challengeId: string
}

class CircleService {
  private sdk: W3SSdk | null = null
  private static instance: CircleService

  private constructor() {}

  public static getInstance(): CircleService {
    if (!CircleService.instance) {
      CircleService.instance = new CircleService()
    }
    return CircleService.instance
  }

  private initializeSdk(userToken?: string, encryptionKey?: string) {
    console.log("ID from outside:" + process.env.NEXT_PUBLIC_CIRCLE_APP_ID);
    if (!this.sdk && userToken && encryptionKey) {
      console.log("ID:" + process.env.NEXT_PUBLIC_CIRCLE_APP_ID);

      this.sdk = new W3SSdk({
        appSettings: {
          appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID!,
        },
        authentication: {
          userToken,
          encryptionKey
        },
      })
    } else if (userToken && encryptionKey && this.sdk) {
      this.sdk.setAuthentication({
        userToken,
        encryptionKey
      })
    }
    return this.sdk
  }

  /**
   * Creates a new user wallet
   */
  public async createUserWallet(email: string): Promise<CreateUserResponse> {
    try {
      const response = await fetch('/api/circle/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create wallet')
      }

      const { data } = await response.json() as CircleResponse

      // Initialize SDK with new credentials
      this.initializeSdk(data.userToken, data.encryptionKey)

      return {
        userId: data.userId,
        userToken: data.userToken,
        encryptionKey: data.encryptionKey,
        challengeId: data.challengeId
      }
    } catch (error) {
      console.error('Error creating user wallet:', error)
      throw error
    }
  }

  /**
   * Executes a wallet challenge (like setting PIN)
   */
  public async executeChallenge(
    challengeId: string,
    userToken: string,
    encryptionKey: string
  ): Promise<void> {
    try {
      const sdk = this.initializeSdk(userToken, encryptionKey)
      if (!sdk) {
        throw new Error('SDK not initialized')
      }

      return new Promise((resolve, reject) => {
        sdk.execute(challengeId, (error, result) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      })
    } catch (error) {
      console.error('Error executing challenge:', error)
      throw error
    }
  }

  /**
   * Gets wallet status
   */
  public async getWalletStatus(userId: string) {
    try {
      const response = await fetch(`/api/circle/wallet-status?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get wallet status')
      }

      return response.json()
    } catch (error) {
      console.error('Error getting wallet status:', error)
      throw error
    }
  }

  /**
   * Requests test tokens
   */
  public async requestTestTokens(address: string) {
    try {
      const response = await fetch('/api/circle/request-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new Error('Failed to request tokens')
      }

      return response.json()
    } catch (error) {
      console.error('Error requesting tokens:', error)
      throw error
    }
  }

  /**
   * Creates and executes a payment
   */
  public async executePayment({
    userId,
    amount,
    destinationAddress,
    tokenId,
    walletId,
    onProgress
  }: {
    userId: string
    amount: number
    destinationAddress: string
    tokenId: string
    walletId: string
    onProgress?: (status: string) => void
  }) {
    try {
      onProgress?.('Initiating payment...')
      
      const response = await fetch('/api/circle/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          destinationAddress,
          tokenId,
          walletId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create transaction')
      }

      const { data } = await response.json()

      onProgress?.('Confirming payment...')
      await this.executeChallenge(
        data.challengeId,
        data.userToken,
        data.encryptionKey
      )

      return { status: 'success', transactionId: data.challengeId }
    } catch (error) {
      console.error('Error executing payment:', error)
      throw error
    }
  }
}

// Export the singleton instance
export const circleService = CircleService.getInstance();