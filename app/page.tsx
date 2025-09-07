"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import NavigationBar from "@/components/NavigationBar";

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', color: '#000' }}>
      <NavigationBar currentPage="Home" pageIcon="🏠" />
      
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
                value={rightMoveUrl}
                onChange={(e) => setRightMoveUrl(e.target.value)}
                required
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '12px 14px',
                  fontSize: 14,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  color: '#000',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  width: '100%',
                  boxShadow: loading ? 'none' : '0 2px 10px rgba(102,126,234,0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? "Scraping..." : "Scrape Property"}
              </button>
            </div>
          </form>
          
          {error && (
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#dc2626', fontSize: 14 }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {property && (
          <div style={{ width: '100%', maxWidth: 600, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: 32, color: '#000', border: '1px solid rgba(255,255,255,0.2)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 600, color: '#000' }}>Property Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div><strong>Price:</strong> {property.price || "N/A"}</div>
              <div><strong>Bedrooms:</strong> {property.bedrooms || "N/A"}</div>
              <div><strong>Bathrooms:</strong> {property.bathrooms || "N/A"}</div>
              <div><strong>Property Type:</strong> {property.propertyType || "N/A"}</div>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <strong>Address:</strong>
              <div style={{ marginTop: 4, color: '#666' }}>{property.address || "N/A"}</div>
            </div>
            
            {property.description && (
              <div style={{ marginBottom: 20 }}>
                <strong>Description:</strong>
                <div style={{ marginTop: 4, color: '#666', lineHeight: 1.5 }}>{property.description}</div>
              </div>
            )}
            
            <Link href={{
              pathname: "/calculator",
              query: {
                price: property.price?.replace(/[£,]/g, "") || "",
                beds: property.bedrooms || "",
                address: property.address || "",
                rightmove: rightMoveUrl
              }
            }}>
              <button style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(16,185,129,0.3)',
                transition: 'all 0.2s ease'
              }}>
                Calculate Investment →
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
