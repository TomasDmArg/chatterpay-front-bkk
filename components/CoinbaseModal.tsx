'use client'

import { useCallback, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CoinbaseIcon } from '@/components/icons/Coinbase'
import { Icons } from '@/components/icons'
import { circleService } from '@/services/circle'
import { useToast } from '@/hooks/use-toast'
import { Steps } from './Steps'

/**
 * Props for the CoinbaseModal component
 */
interface CoinbaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  paymentAmount?: number
  currency?: string
  destinationAddress?: string
  tokenId?: string
  mode?: 'create' | 'pay'
}

enum WalletStatus {
  INPUT = 'input',
  CREATING = 'creating',
  SETTING_PIN = 'setting_pin',
  PAYING = 'paying',
  COMPLETE = 'complete'
}

export function CoinbaseModal({ 
  isOpen,
  onClose,
  onSuccess,
  paymentAmount = 0,
  currency = 'USDC',
  destinationAddress,
  tokenId,
  mode = 'create'
}: CoinbaseModalProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState<WalletStatus>(WalletStatus.INPUT)
  const [email, setEmail] = useState('')
  const [progress, setProgress] = useState('')
  const [walletData, setWalletData] = useState<{
    userId: string
    walletId: string
  } | null>(null)
  const [challengeData, setChallengeData] = useState<{
    challengeId: string
    userToken: string
    encryptionKey: string
  } | null>(null)

  const handleCreateWallet = useCallback(async () => {
    if (!email) return

    try {
      setStatus(WalletStatus.CREATING)

      // Create user and wallet
      const response = await circleService.createUserWallet(email)
      
      setChallengeData(response)
      setStatus(WalletStatus.SETTING_PIN)

      // Execute the challenge (PIN setup)
      await circleService.executeChallenge(
        response.challengeId,
        response.userToken,
        response.encryptionKey
      )

      // Get wallet status
      const wallets = await circleService.getWalletStatus(response.userId)
      if (wallets.length > 0) {
        setWalletData({
          userId: response.userId,
          walletId: wallets[0].id
        })
        await circleService.requestTestTokens(wallets[0].address)

        if (mode === 'pay' && destinationAddress && tokenId) {
          setStatus(WalletStatus.PAYING)

          // Execute payment
          await circleService.executePayment({
            userId: response.userId,
            amount: paymentAmount,
            destinationAddress,
            tokenId,
            walletId: wallets[0].id,
            onProgress: setProgress
          })
        }

        setStatus(WalletStatus.COMPLETE)
        toast({
          title: 'Success',
          description: mode === 'pay' ? 'Payment completed successfully!' : 'Wallet created successfully!',
        })
        onSuccess()
      } else {
        toast({ title: 'Error', description: 'No wallets found', variant: 'destructive' })
      }

    } catch (error) {
      console.error('Error during wallet flow:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Operation failed',
        variant: 'destructive',
      })
      setStatus(WalletStatus.INPUT)
    }
  }, [email, paymentAmount, destinationAddress, tokenId, onSuccess, toast, mode])

  const getCurrentStep = useCallback(() => {
    switch (status) {
      case WalletStatus.CREATING:
        return 1
      case WalletStatus.SETTING_PIN:
        return 2
      case WalletStatus.PAYING:
        return mode === 'pay' ? 3 : 4
      case WalletStatus.COMPLETE:
        return mode === 'pay' ? 4 : 4
      default:
        return 0
    }
  }, [status, mode])

  const getSteps = () => {
    const baseSteps = [
      { label: 'Email' },
      { label: 'Create Wallet' },
      { label: 'Set PIN' },
    ]
    
    return mode === 'pay' 
      ? [...baseSteps, { label: 'Pay' }, { label: 'Complete' }]
      : [...baseSteps, { label: 'Complete' }]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CoinbaseIcon className="h-5 w-5" />
            {mode === 'pay' ? `Pay with Circle Wallet` : 'Create Circle Wallet'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'pay' 
              ? `Create your wallet and pay ${paymentAmount} ${currency}`
              : 'Create your Circle wallet to start using crypto'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Steps
            steps={getSteps()}
            currentStep={getCurrentStep()}
          />

          {status === WalletStatus.INPUT && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleCreateWallet}
                disabled={!email}
              >
                {mode === 'pay' ? 'Continue to Payment' : 'Create Wallet'}
              </Button>
            </div>
          )}

          {(status === WalletStatus.CREATING || 
            status === WalletStatus.SETTING_PIN || 
            status === WalletStatus.PAYING) && (
            <div className="flex flex-col items-center space-y-4">
              <Icons.spinner className="h-8 w-8 animate-spin" />
              <p className="text-center text-sm">
                {progress || getStatusMessage(status)}
              </p>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to Circle&apos;s Terms of Service and Privacy Policy
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getStatusMessage(status: WalletStatus): string {
  switch (status) {
    case WalletStatus.CREATING:
      return 'Creating your wallet...'
    case WalletStatus.SETTING_PIN:
      return 'Setting up your PIN...'
    case WalletStatus.PAYING:
      return 'Processing payment...'
    default:
      return ''
  }
}