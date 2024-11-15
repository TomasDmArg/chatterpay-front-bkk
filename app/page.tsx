'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from '@/components/icons'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [whatsappNumber, setWhatsappNumber] = useState<string>('')

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      window.location.href = '/dashboard'
    }, 3000)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[350px]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className='text-center'>
              Enter your WhatsApp number to sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Input 
                id="whatsapp" 
                type="tel" 
                className='text-center'
                placeholder="+1234567890"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={onSubmit} disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In with ChatterPay
            </Button>
            <Button variant="link" className="w-full opacity-70" onClick={() => window.location.href = '/register'}>
              Create my account
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}