'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface NavigationBarProps {
  currentPage: string
  pageIcon: string
}

export default function NavigationBar({ currentPage, pageIcon }: NavigationBarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/calculator', label: 'Calculator', icon: '🧮' },
    { href: '/property-search', label: 'Property Search', icon: '🔍' },
    { href: '/developer-tools', label: 'Developer Tools', icon: '🏗️' },
    { href: '/checklist', label: 'Checklist', icon: '📋' }
  ]

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(15px)',
        padding: '12px 16px', borderBottom: '1px solid rgba(102,126,234,0.2)',
        zIndex: 1000, display: 'none', boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ 
            fontSize: 18, 
            fontWeight: 700, 
            margin: 0, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {pageIcon} {currentPage}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              display: 'flex', 
              gap: 8,
              background: 'rgba(102,126,234,0.1)',
              borderRadius: 20,
              padding: '6px 8px'
            }}>
              {navItems.map(item => (
                <Link key={item.href} href={item.href} style={{
                  color: pathname === item.href ? '#fff' : '#667eea',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '6px 10px',
                  borderRadius: 12,
                  background: pathname === item.href 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}>
                  {item.icon}
                </Link>
              ))}
            </div>
            <button
              onClick={handleLogout}
              style={{
                color: '#dc2626',
                fontSize: 11,
                fontWeight: 600,
                padding: '6px 10px',
                borderRadius: 12,
                background: 'rgba(220, 38, 38, 0.1)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Sign Out"
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="sidebar" style={{ 
        width: 320, 
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(0,0,0,0.1)', 
        minHeight: '100vh', 
        padding: '40px 32px 32px 32px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 32, 
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)', 
        color: '#000'
      }}>
        <div>
          <h1 style={{ 
            fontSize: 24, 
            fontWeight: 700, 
            margin: 0, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Property Insides
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 8, fontWeight: 500 }}>
            Real Estate Investment Tools
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* User Info */}
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(102,126,234,0.1)',
            borderRadius: 12,
            marginBottom: 8
          }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Signed in as:</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{user?.email}</div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 12,
                textDecoration: 'none',
                color: pathname === item.href ? '#fff' : '#374151',
                background: pathname === item.href 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'rgba(102,126,234,0.1)',
                fontWeight: 500,
                fontSize: 14,
                transition: 'all 0.2s ease',
                boxShadow: pathname === item.href ? '0 4px 15px rgba(102,126,234,0.4)' : 'none'
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                color: '#dc2626',
                background: 'rgba(220, 38, 38, 0.1)',
                fontWeight: 500,
                fontSize: 14,
                transition: 'all 0.2s ease',
                marginTop: 16
              }}
            >
              <span style={{ fontSize: 16 }}>🚪</span>
              Sign Out
            </button>
          </nav>
        </div>

        <div style={{ 
          marginTop: 'auto', 
          padding: '16px 0', 
          borderTop: '1px solid rgba(102,126,234,0.2)',
          fontSize: 12,
          color: '#6b7280',
          textAlign: 'center'
        }}>
          © 2024 Property Insides
        </div>
      </aside>

      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .main-content { padding: 16px 12px !important; padding-top: 80px !important; width: 100% !important; }
          .mobile-header { display: block !important; }
        }
      `}</style>
    </>
  )
}
