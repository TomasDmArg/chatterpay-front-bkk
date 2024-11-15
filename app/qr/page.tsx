'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

export default function QRCodePage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [qrCode, setQRCode] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [cashierName, setCashierName] = useState('')
  const [lastPayment, setLastPayment] = useState({ amount: 0, cashier: '' })

  useEffect(() => {
    // Simulating API call to fetch QR code, business details, and last payment
    setTimeout(() => {
      setQRCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Example')
      setBusinessName('My Business')
      setCashierName('John Doe')
      setLastPayment({ amount: 50, cashier: 'John Doe' })
      setLoading(false)
    }, 1500)
  }, [])

  return (
    <div className="container mx-auto p-4">
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {businessName ? `${businessName} - Cashier: ${cashierName}` : 'Scan to Pay'}
      </motion.h1>
      <div className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="w-[300px]">
            <CardHeader>
              <CardTitle>{businessName || 'Scan to Pay'}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {loading ? (
                <Icons.spinner className="h-16 w-16 animate-spin" />
              ) : (
                <>
                  <img src={qrCode} alt="QR Code" className="mb-4" />
                  {lastPayment.amount > 0 && (
                    <p className="text-sm text-gray-500 mb-4">
                      Last Payment: ${lastPayment.amount} by {lastPayment.cashier}
                    </p>
                  )}
                  <div className="space-y-2 w-full">
                    <Button className="w-full">
                      Pay with WhatsApp
                    </Button>
                    <Button variant="outline" className="w-full">
                      Pay with Coinbase
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}