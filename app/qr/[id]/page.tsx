'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CoinbaseModal } from '@/components/CoinbaseModal'
import { Icons } from '@/components/icons'
import { CoinbaseIcon } from '@/components/icons/Coinbase'
import { WhatsAppIcon } from '@/components/icons/WhatsApp'
import { useToast } from '@/hooks/use-toast'

interface QRCodeResponse {
    qrCodeId: string
    payURL: string
    payment: {
        amount: number
        currency: string
        createdAt: string
        destinationAddress: string // Añadido para Circle
        tokenId: string           // Añadido para Circle
    }
    business: {
        name: string
        logo: string
    }
}

interface QRCodePageProps {
    params: {
        id: string
    }
}

export default function QRCodePage({ params }: QRCodePageProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [qrDetails, setQRDetails] = useState<QRCodeResponse | null>(null)
    const [isCoinbaseModalOpen, setIsCoinbaseModalOpen] = useState(false)

    /**
     * Fetches QR code details from the API
     */
    const fetchQRDetails = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/${params.id}`)

            if (!response.ok) {
                throw new Error('Failed to fetch QR code details')
            }

            const data = await response.json()
            setQRDetails(data.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        fetchQRDetails()
    }, [fetchQRDetails])

    /**
     * Handles WhatsApp payment initiation
     */
    const handleWhatsAppPay = useCallback(() => {
        if (qrDetails?.payURL) {
            window.location.href = qrDetails.payURL
        }
    }, [qrDetails?.payURL])

    /**
     * Handles successful Coinbase/Circle wallet payment
     */
    const handleCircleSuccess = useCallback(() => {
        setIsCoinbaseModalOpen(false)
        toast({
            title: 'Success',
            description: 'Payment completed successfully!',
        })
        // Aquí podrías redirigir a una página de éxito o refrescar los detalles
        fetchQRDetails()
    }, [toast, fetchQRDetails])

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="container mx-auto p-4 text-center"
            >
                <p className="text-red-500">{error}</p>
                <Button
                    onClick={() => router.push('/')}
                    className="mt-4"
                >
                    Go Home
                </Button>
            </motion.div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center"
            >
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="flex flex-col items-center gap-4">
                            {qrDetails?.business.logo && (
                                <motion.img
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    src={qrDetails.business.logo}
                                    alt={qrDetails.business.name}
                                    className="h-16 w-16 rounded-full shadow-md"
                                />
                            )}
                            <span className="text-xl font-bold">
                                {qrDetails?.business.name || 'Loading...'}
                            </span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center space-y-6">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="spinner"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Icons.spinner className="h-16 w-16 animate-spin" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full space-y-6"
                                >
                                    {qrDetails?.payment && (
                                        <div className="text-center">
                                            <motion.p
                                                initial={{ scale: 0.9 }}
                                                animate={{ scale: 1 }}
                                                className="text-3xl font-bold"
                                            >
                                                {qrDetails.payment.amount} {qrDetails.payment.currency}
                                            </motion.p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {new Date(qrDetails.payment.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    )}

                                    {qrDetails?.payURL && (
                                        <div className="flex justify-center p-10 bg-secondary rounded-lg w-fit mx-auto">
                                            <QRCodeSVG
                                                value={qrDetails.payURL}
                                                size={200}
                                                bgColor="#ffffff00"
                                                fgColor="#0A9972"
                                                level="H"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-3 w-full">
                                        <Button
                                            className="w-full bg-[#25D366] hover:bg-[#128C7E] transition-all duration-200"
                                            onClick={handleWhatsAppPay}
                                            disabled={loading || !qrDetails?.payURL}
                                        >
                                            <WhatsAppIcon className="mr-2 h-5 w-5" />
                                            Pay with WhatsApp
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full hover:bg-secondary transition-all duration-200"
                                            onClick={() => setIsCoinbaseModalOpen(true)}
                                            disabled={loading}
                                        >
                                            <CoinbaseIcon className="mr-2 h-5 w-5" />
                                            Pay with Coinbase
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            <CoinbaseModal
                isOpen={isCoinbaseModalOpen}
                onClose={() => setIsCoinbaseModalOpen(false)}
                onSuccess={handleCircleSuccess}
                paymentAmount={qrDetails?.payment?.amount}
                currency={qrDetails?.payment?.currency}
                destinationAddress={qrDetails?.payment?.destinationAddress!}
                tokenId={qrDetails?.payment?.tokenId!}
            />
        </div>
    )
}