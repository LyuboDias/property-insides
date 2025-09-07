"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import NavigationBar from "@/components/NavigationBar";

interface MarketData {
  overview: {
    avgRentalYield: number;
    avgPropertyPrice: number;
    rentalDemand: number;
    marketGrowth: number;
  };
  regionalYields: Array<{
    region: string;
    yield: number;
    avgPrice: number;
    avgRent: number;
  }>;
  trends: Array<{
    month: string;
    price: number;
    rent: number;
  }>;
  lastUpdated?: string;
}

export default function Home() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch live market data
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching live market data...');
      
      const response = await fetch('/api/market-data', {
        cache: 'no-store' // Always fetch fresh data
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMarketData(result.data);
        setLastRefresh(new Date());
        console.log('Market data updated successfully');
      } else {
        throw new Error(result.error || 'Failed to fetch market data');
      }
      
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Set fallback data if API fails
      setMarketData({
        overview: {
          avgRentalYield: 4.8,
          avgPropertyPrice: 285000,
          rentalDemand: 87,
          marketGrowth: 3.2
        },
        regionalYields: [
          { region: "North East", yield: 6.8, avgPrice: 145000, avgRent: 850 },
          { region: "North West", yield: 5.9, avgPrice: 185000, avgRent: 950 },
          { region: "Yorkshire", yield: 5.5, avgPrice: 195000, avgRent: 925 },
          { region: "Midlands", yield: 5.2, avgPrice: 225000, avgRent: 1050 },
          { region: "South West", yield: 4.1, avgPrice: 320000, avgRent: 1200 },
          { region: "South East", yield: 3.8, avgPrice: 425000, avgRent: 1450 },
          { region: "London", yield: 3.2, avgPrice: 650000, avgRent: 1850 }
        ],
        trends: [
          { month: "Jan 2024", price: 278000, rent: 1150 },
          { month: "Mar 2024", price: 281000, rent: 1165 },
          { month: "May 2024", price: 283000, rent: 1175 },
          { month: "Jul 2024", price: 285000, rent: 1185 },
          { month: "Sep 2024", price: 287000, rent: 1195 },
          { month: "Nov 2024", price: 289000, rent: 1205 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  // Handle refresh button
  const handleRefresh = () => {
    fetchMarketData();
  };

  if (loading && !marketData) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', color: '#000' }}>
        <NavigationBar currentPage="Home" pageIcon="🏠" />
        <div className="main-content" style={{ flex: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32, color: '#000', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 8px 0' }}>Loading Live Market Data...</h2>
            <p style={{ color: '#6b7280', fontSize: 16 }}>Scraping the latest UK buy-to-let market insights</p>
            <div style={{ 
              width: 40, height: 40, border: '3px solid #f3f4f6', borderTop: '3px solid #667eea', 
              borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '20px auto'
            }}></div>
          </div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', color: '#000' }}>
      <NavigationBar currentPage="Home" pageIcon="🏠" />
      
      {/* Main content */}
      <div className="main-content" style={{ flex: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32, color: '#000' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              UK Buy-to-Let Market Analytics
            </h1>
            <button
              onClick={handleRefresh}
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: loading ? 'none' : '0 2px 10px rgba(16,185,129,0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              🔄 {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          <p style={{ color: '#6b7280', fontSize: 16 }}>Real-time insights and trends for property investment decisions</p>
          
          {/* Data Status */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, fontSize: 12, color: '#9ca3af' }}>
            {lastRefresh && (
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            )}
            {error && (
              <span style={{ color: '#ef4444' }}>⚠️ Using fallback data: {error}</span>
            )}
            {marketData?.lastUpdated && (
              <span>Data from: {new Date(marketData.lastUpdated).toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Market Overview Cards */}
        {marketData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📊</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#6b7280' }}>Average Rental Yield</h3>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#000' }}>{marketData.overview.avgRentalYield}%</p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#059669' }}>+0.3% vs last quarter</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏠</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#6b7280' }}>Avg Property Price</h3>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#000' }}>£{marketData.overview.avgPropertyPrice.toLocaleString()}</p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#667eea' }}>+{marketData.overview.marketGrowth}% annual growth</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔥</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#6b7280' }}>Rental Demand</h3>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#000' }}>{marketData.overview.rentalDemand}%</p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#d97706' }}>High demand market</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📈</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#6b7280' }}>Market Growth</h3>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#000' }}>+{marketData.overview.marketGrowth}%</p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#7c3aed' }}>Year-on-year growth</p>
            </div>
          </div>
        )}

        {marketData && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              {/* Regional Rental Yields Chart */}
              <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 600 }}>Regional Rental Yields</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {marketData.regionalYields.map((region, index) => (
                    <div key={region.region} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ minWidth: 100, fontSize: 14, fontWeight: 500 }}>{region.region}</div>
                      <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${(region.yield / 7) * 100}%`, 
                          height: '100%', 
                          background: `linear-gradient(135deg, hsl(${120 + (region.yield * 15)}, 70%, 50%) 0%, hsl(${120 + (region.yield * 15)}, 70%, 40%) 100%)`,
                          borderRadius: 4,
                          transition: 'width 1s ease'
                        }}></div>
                      </div>
                      <div style={{ minWidth: 60, fontSize: 14, fontWeight: 600, color: '#059669' }}>{region.yield}%</div>
                      <div style={{ minWidth: 80, fontSize: 12, color: '#6b7280' }}>£{region.avgPrice.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Regions */}
              <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 600 }}>Top Performers</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {marketData.regionalYields.slice(0, 4).map((region, index) => (
                    <div key={region.region} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: index < 3 ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)', borderRadius: 8 }}>
                      <div style={{ 
                        width: 24, height: 24, borderRadius: 12, 
                        background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7c2f' : '#6b7280',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: '#fff', fontSize: 10, fontWeight: 600 
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{region.region}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>£{region.avgRent}/month</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>{region.yield}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Trends */}
            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 600 }}>Market Trends (2024)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 20 }}>
                {marketData.trends.map((trend, index) => (
                  <div key={trend.month} style={{ textAlign: 'center', padding: 16, borderRadius: 8, background: index === marketData.trends.length - 1 ? 'rgba(16,185,129,0.1)' : 'transparent' }}>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{trend.month}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#000', marginBottom: 2 }}>£{(trend.price / 1000).toFixed(0)}k</div>
                    <div style={{ fontSize: 12, color: '#059669' }}>£{trend.rent}/mo</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/property-search">
            <button style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '16px 32px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
              transition: 'all 0.2s ease'
            }}>
              🔍 Search Properties
            </button>
          </Link>
          <Link href="/calculator">
            <button style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '16px 32px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
              transition: 'all 0.2s ease'
            }}>
              🧮 Calculate ROI
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
