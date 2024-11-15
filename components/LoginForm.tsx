// src/components/composed/LoginForm/LoginForm.tsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoaderCircle, ChevronLeft, ArrowRight } from "lucide-react"
import { PhoneInputField } from './PhoneInputField/PhoneInputField'
import { VerificationStep } from './VerificationStep'

interface LoginFormProps {
  onSubmit: (data: { phone: string, verificationCode: string }) => Promise<void>
}

const slideVariants = {
  enter: { x: 50, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -50, opacity: 0 }
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('54')
  const [verificationCode, setVerificationCode] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    
    try {
      await onSubmit({ phone, verificationCode })
      if (step === 1) {
        setStep(2)
      }
    } catch (error) {
      console.error('Error during submission:', error)
      // Handle error appropriately
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="mt-12">
        <CardTitle className="text-2xl text-center">
          {step === 1 ? 
            "ChatterPay for Business" :
            "We've sent you a code!"
          }
        </CardTitle>
        <CardDescription className="text-center">
          {step === 1 ? 
            "Enter your WhatsApp number to sign in" : 
            "Enter the verification code sent to your WhatsApp"
          }
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
        <CardContent className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={{
                enter: { y: 50, opacity: 0 },
                center: { y: 0, opacity: 1 },
                exit: { y: -50, opacity: 0 }
              }}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex-row items-center justify-center"
              transition={{ duration: 0.3 }}
            >
              {step === 1 ? (
                <div className="relative w-full mx-auto">
                  <PhoneInputField
                    value={phone}
                    onChange={setPhone}
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <VerificationStep
                  value={verificationCode}
                  onChange={setVerificationCode}
                  disabled={isLoading}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 w-full mt-12">
          <Button 
            className="w-full" 
            disabled={isLoading || (step === 1 ? !phone : !verificationCode)}
            type="submit"
          >
            {isLoading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : step === 1 ? (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Sign In with ChatterPay"
            )}
          </Button>

          {step === 1 ? (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => window.location.href = '/register'}
              type="button"
            >
              Create my account
            </Button>
          ) : (
            <button 
              className="w-fit flex flex-row items-center justify-start text-sm h-12 opacity-70"
              onClick={() => setStep(1)}
              type="button"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}