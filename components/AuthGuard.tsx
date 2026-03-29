'use client'

/**
 * Auth gate disabled — always renders children.
 * Previous redirect/session logic is in git history if you need to require login again.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
