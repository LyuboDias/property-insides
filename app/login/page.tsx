'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Sign-in step disabled: /login sends users to the app root.
 * Previous login form UI is in git history (search commits touching this file) if you need to restore it.
 */
export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/')
  }, [router])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #faf5ff 100%)',
      }}
    >
      <p style={{ color: '#6b7280', fontSize: 16 }}>Redirecting…</p>
    </div>
  )
}
