'use client'

import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { LoginForm } from '@/components/LoginForm'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/user'

interface SubmitData {
  phone: string
  verificationCode: string
}

export default function LoginPage () {
  const router = useRouter();
  const { isAuthenticated, login, verifyCode } = useAuth();

  const handleSubmit = async ({ phone, verificationCode }: SubmitData) => {
    if (!verificationCode) {
      await login(phone, 'ChatterPay for Business')
    } else {
      await verifyCode(phone, verificationCode)
    }
  }

  useCallback(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full flex items-center justify-center"
      >
        <LoginForm onSubmit={handleSubmit} />
      </motion.div>
    </div>
  )
}