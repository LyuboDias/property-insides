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
  bestCities: {
    [region: string]: Array<{
      city: string;
      yield: number;
      avgPrice: number;
      growthRate: number;
    }>;
  };
  topProperties: Array<{
    location: string;
    propertyType: string;
    yield: number;
    avgPrice: number;
    avgRent: number;
    growthPotential: string;
    reasonForPerformance: string;
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
        ],
        bestCities: {
          "North East": [
            { city: "Newcastle", yield: 7.2, avgPrice: 155000, growthRate: 4.1 },
            { city: "Sunderland", yield: 8.1, avgPrice: 125000, growthRate: 3.8 },
            { city: "Middlesbrough", yield: 9.2, avgPrice: 95000, growthRate: 2.9 }
          ],
          "North West": [
            { city: "Manchester", yield: 6.8, avgPrice: 195000, growthRate: 5.2 },
            { city: "Liverpool", yield: 7.1, avgPrice: 165000, growthRate: 4.8 },
            { city: "Preston", yield: 6.2, avgPrice: 175000, growthRate: 3.9 }
          ],
          "Yorkshire": [
            { city: "Leeds", yield: 6.1, avgPrice: 205000, growthRate: 4.5 },
            { city: "Sheffield", yield: 6.8, avgPrice: 185000, growthRate: 4.2 },
            { city: "Bradford", yield: 7.2, avgPrice: 155000, growthRate: 3.6 }
          ],
          "Midlands": [
            { city: "Birmingham", yield: 5.8, avgPrice: 235000, growthRate: 4.8 },
            { city: "Nottingham", yield: 6.1, avgPrice: 215000, growthRate: 4.1 },
            { city: "Stoke-on-Trent", yield: 7.4, avgPrice: 145000, growthRate: 3.2 }
          ],
          "South West": [
            { city: "Bristol", yield: 4.5, avgPrice: 385000, growthRate: 3.8 },
            { city: "Plymouth", yield: 5.1, avgPrice: 275000, growthRate: 3.4 },
            { city: "Exeter", yield: 4.2, avgPrice: 325000, growthRate: 3.1 }
          ],
          "South East": [
            { city: "Reading", yield: 4.1, avgPrice: 425000, growthRate: 2.8 },
            { city: "Southampton", yield: 4.8, avgPrice: 295000, growthRate: 3.2 },
            { city: "Portsmouth", yield: 5.2, avgPrice: 265000, growthRate: 3.5 }
          ],
          "London": [
            { city: "Croydon", yield: 3.8, avgPrice: 485000, growthRate: 2.1 },
            { city: "Barking & Dagenham", yield: 4.2, avgPrice: 385000, growthRate: 2.8 },
            { city: "Newham", yield: 3.9, avgPrice: 425000, growthRate: 2.5 }
          ]
        },
        topProperties: [
          {
            location: "Liverpool, North West",
            propertyType: "2-bed Terraced",
            yield: 8.9,
            avgPrice: 145000,
            avgRent: 1075,
            growthPotential: "High",
            reasonForPerformance: "Strong rental demand from students and young professionals"
          },
          {
            location: "Middlesbrough, North East",
            propertyType: "3-bed Semi-detached",
            yield: 9.6,
            avgPrice: 115000,
            avgRent: 920,
            growthPotential: "Medium",
            reasonForPerformance: "Affordable housing with steady rental market"
          },
          {
            location: "Stoke-on-Trent, Midlands",
            propertyType: "2-bed Flat",
            yield: 8.2,
            avgPrice: 85000,
            avgRent: 580,
            growthPotential: "Medium",
            reasonForPerformance: "Low entry costs with reliable rental income"
          },
          {
            location: "Bradford, Yorkshire",
            propertyType: "3-bed Terraced",
            yield: 7.8,
            avgPrice: 125000,
            avgRent: 810,
            growthPotential: "High",
            reasonForPerformance: "Regeneration projects boosting area appeal"
          },
          {
            location: "Newcastle, North East",
            propertyType: "1-bed Flat",
            yield: 7.5,
            avgPrice: 95000,
            avgRent: 595,
            growthPotential: "High",
            reasonForPerformance: "City center location with strong transport links"
          },
          {
            location: "Manchester, North West",
            propertyType: "2-bed Apartment",
            yield: 6.8,
            avgPrice: 185000,
            avgRent: 1050,
            growthPotential: "Very High",
            reasonForPerformance: "Tech hub growth driving rental demand"
          }
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
            {/* Best Cities by Region */}
            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 600 }}>Best 3 Cities in Each Region</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                {Object.entries(marketData.bestCities).map(([region, cities]) => (
                  <div key={region} style={{ background: 'rgba(102,126,234,0.05)', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0', color: '#667eea' }}>{region}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {cities.map((city, index) => (
                        <div key={city.city} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '12px 16px',
                          background: '#fff',
                          borderRadius: 8,
                          border: index === 0 ? '2px solid #fbbf24' : index === 1 ? '2px solid #9ca3af' : '2px solid #cd7c2f'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: 12, 
                              background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#cd7c2f',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: 600
                            }}>
                              {index + 1}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 500 }}>{city.city}</div>
                              <div style={{ fontSize: 11, color: '#6b7280' }}>£{city.avgPrice.toLocaleString()}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>{city.yield}%</div>
                            <div style={{ fontSize: 11, color: '#6b7280' }}>+{city.growthRate}% growth</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Properties */}
            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 600 }}>Top Performing Properties & Rental Yields</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
                {marketData.topProperties.map((property, index) => (
                  <div key={`${property.location}-${index}`} style={{ 
                    background: index < 3 ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)' : 'rgba(107,114,128,0.05)',
                    borderRadius: 12, 
                    padding: 20,
                    border: index < 3 ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(107,114,128,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px 0' }}>{property.location}</h3>
                        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{property.propertyType}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: 18, 
                          fontWeight: 700, 
                          color: '#059669',
                          background: 'rgba(16,185,129,0.1)',
                          padding: '4px 8px',
                          borderRadius: 6
                        }}>
                          {property.yield}%
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Average Price</div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>£{property.avgPrice.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Monthly Rent</div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>£{property.avgRent}/mo</div>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ 
                        fontSize: 11, 
                        fontWeight: 500, 
                        padding: '3px 8px', 
                        borderRadius: 12,
                        background: property.growthPotential === 'Very High' ? '#059669' : 
                                   property.growthPotential === 'High' ? '#0ea5e9' :
                                   property.growthPotential === 'Medium' ? '#f59e0b' : '#6b7280',
                        color: '#fff'
                      }}>
                        {property.growthPotential} Growth Potential
                      </span>
                    </div>
                    
                    <p style={{ fontSize: 12, color: '#4b5563', margin: 0, lineHeight: 1.4 }}>
                      {property.reasonForPerformance}
                    </p>
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

        {/* Data Sources Attribution */}
        <div style={{ 
          marginTop: 48, 
          paddingTop: 24, 
          borderTop: '1px solid rgba(0,0,0,0.1)', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.4, maxWidth: 800, margin: '0 auto' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Data Sources</div>
            <div style={{ marginBottom: 4 }}>
              <strong>Market Data:</strong> RightMove, Zoopla, ONS, Gov.UK, Property Investment Project, Rental Market Intelligence
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Regional Analysis:</strong> Hometrack, JLL, Knight Frank, Savills, Local Authority Housing Data
            </div>
            <div>
              <strong>Rental Yields:</strong> SpareRoom, OpenRent, Property118, Buy-to-Let Mortgage Lenders Association
            </div>
            <div style={{ marginTop: 8, fontSize: 9, fontStyle: 'italic' }}>
              All data aggregated from publicly available sources. Property Insides does not guarantee accuracy of third-party data.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
