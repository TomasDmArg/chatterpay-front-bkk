'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Default QR page that redirects to home
 */
export default function QRPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/')
  }, [router])

  return null
}