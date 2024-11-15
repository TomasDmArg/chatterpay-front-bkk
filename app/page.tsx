'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LoginForm } from '@/components/LoginForm'

export default function LoginPage () {
  const handleSubmit = async ({ phone, verificationCode }: { phone: string, verificationCode: string }) => {
    if (!verificationCode) {
      // First step: Send verification code
      await new Promise(resolve => setTimeout(resolve, 500))
    } else {
      // Second step: Verify code and redirect
      await new Promise(resolve => setTimeout(resolve, 2000))
      window.location.href = '/dashboard'
    }
  }

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