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
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex', color: '#000' }}>
      {/* Sidebar */}
      <aside style={{ width: 320, background: '#fff', borderRight: '1px solid #e5e7eb', minHeight: '100vh', padding: '40px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 32, boxShadow: '2px 0 8px rgba(0,0,0,0.04)', color: '#000' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: '#000' }}>Property Link Submission</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/property-search" style={{ color: '#0070f3', fontWeight: 500, fontSize: 15, textDecoration: 'underline' }}>Property Search</Link>
            <Link href="/calculator" style={{ color: '#0070f3', fontWeight: 500, fontSize: 15, textDecoration: 'underline' }}>Calculator</Link>
            <Link href="/checklist" style={{ color: '#0070f3', fontWeight: 500, fontSize: 15, textDecoration: 'underline' }}>Checklist</Link>
          </div>
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#000' }}>Instructions</h2>
          <ul style={{ color: '#000', fontSize: 14, paddingLeft: 18, margin: 0, lineHeight: 1.7 }}>
            <li>Paste a RightMove link and click Scrape</li>
            <li>View the property details below</li>
            <li>Use the Calculator for deal analysis</li>
          </ul>
        </div>
      </aside>
      {/* Main content */}
      <div style={{ flex: 1, padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#000' }}>
        <div style={{ width: '100%', maxWidth: 600, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, marginBottom: 32, color: '#000' }}>
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
  );
}
