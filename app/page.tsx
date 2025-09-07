"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  // State for RightMove link and scraped property info
  const [rightMoveUrl, setRightMoveUrl] = useState("");
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Handles scraping the RightMove property page via API
   */
  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProperty(null);
    try {
      const res = await fetch("/api/scrape-rightmove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rightMoveUrl }),
      });
      if (!res.ok) throw new Error("Failed to fetch property info");
      const data = await res.json();
      setProperty(data.property);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .main-content { padding: 16px 12px !important; padding-top: 80px !important; width: 100% !important; }
          .mobile-header { display: block !important; }
        }
      `}</style>
      
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', color: '#000' }}>
        
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
              🏠 Home
            </h1>
            <div style={{ 
              display: 'flex', 
              gap: 8,
              background: 'rgba(102,126,234,0.1)',
              borderRadius: 20,
              padding: '6px 8px'
            }}>
              <span style={{
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                padding: '6px 10px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}>
                🏠
              </span>
              <Link href="/calculator" style={{ 
                color: '#666', 
                textDecoration: 'none', 
                fontSize: 11,
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: 12,
                transition: 'all 0.2s'
              }}>
                🧮
              </Link>
              <Link href="/checklist" style={{ 
                color: '#666', 
                textDecoration: 'none', 
                fontSize: 11,
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: 12,
                transition: 'all 0.2s'
              }}>
                ✅
              </Link>
              <Link href="/property-search" style={{ 
                color: '#666', 
                textDecoration: 'none', 
                fontSize: 11,
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: 12,
                transition: 'all 0.2s'
              }}>
                🔍
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar - Desktop only */}
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
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Property Insides
          </h1>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>Your property investment toolkit</p>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/" style={{ 
              color: '#fff', 
              textDecoration: 'none', 
              fontSize: 14, 
              padding: '12px 16px', 
              borderRadius: 12, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              🏠 Home
            </Link>
            <Link href="/calculator" style={{ 
              color: '#666', 
              textDecoration: 'none', 
              fontSize: 14, 
              padding: '12px 16px', 
              borderRadius: 12, 
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              🧮 Calculator
            </Link>
            <Link href="/checklist" style={{ 
              color: '#666', 
              textDecoration: 'none', 
              fontSize: 14, 
              padding: '12px 16px', 
              borderRadius: 12, 
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              ✅ Checklist
            </Link>
            <Link href="/property-search" style={{ 
              color: '#666', 
              textDecoration: 'none', 
              fontSize: 14, 
              padding: '12px 16px', 
              borderRadius: 12, 
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              🔍 Property Search
            </Link>
          </nav>
        </div>
      </aside>
      {/* Main content */}
      <div className="main-content" style={{ flex: 1, padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#000' }}>
        <div style={{ width: '100%', maxWidth: 600, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: 32, marginBottom: 32, color: '#000', border: '1px solid rgba(255,255,255,0.2)' }}>
          <form onSubmit={handleScrape} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>RightMove</label>
              <input
                type="url"
                name="rightmove"
                placeholder="Enter RightMove link"
                style={{ width: '100%', background: '#f4f6fa', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 15, color: '#000', outline: 'none', fontWeight: 400, marginTop: 2, marginBottom: 2, transition: 'border 0.2s' }}
                value={rightMoveUrl}
                onChange={e => setRightMoveUrl(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Zoopla</label>
              <input type="url" name="zoopla" placeholder="Enter Zoopla link" style={{ width: '100%', background: '#f4f6fa', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 15, color: '#000', outline: 'none', fontWeight: 400, marginTop: 2, marginBottom: 2, transition: 'border 0.2s' }} disabled />
            </div>
            <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
              <button type="submit" style={{ background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginTop: 8 }} disabled={loading || !rightMoveUrl}>
                {loading ? "Scraping..." : "Scrape Property Info"}
              </button>
            </div>
          </form>
          {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
        </div>
        {property && (
          <div style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb', padding: 24, maxWidth: 600, width: '100%', color: '#000' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                {Object.entries(property).map(([key, value]) => (
                  <tr key={key}>
                    <th style={{ textAlign: 'left', fontWeight: 600, padding: '8px 10px', background: 'transparent', color: '#000', borderBottom: '1px solid #e5e7eb' }}>{key}</th>
                    <td style={{ textAlign: 'right', fontWeight: 400, padding: '8px 10px', background: 'transparent', color: '#000', borderBottom: '1px solid #e5e7eb' }}>{value as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
