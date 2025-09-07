"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import NavigationBar from "@/components/NavigationBar";

interface BRRCalculation {
  purchasePrice: number;
  refurbCost: number;
  refinanceValue: number;
  totalInvested: number;
  cashLeft: number;
  instantEquity: number;
  monthlyRent: number;
  monthlyProfit: number;
  totalROI: number;
  cashOnCashReturn: number;
}

interface ConstructionCosts {
  region: string;
  basicRefurb: number;
  mediumRefurb: number;
  highEndRefurb: number;
  extension: number;
  loftConversion: number;
  kitchenFull: number;
  bathroomFull: number;
}

interface ValueAddOpportunity {
  type: string;
  description: string;
  costEstimate: number;
  valueIncrease: number;
  timeframe: string;
  complexity: string;
  roi: number;
}

export default function DeveloperTools() {
  // BRR Calculator State
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [refurbCost, setRefurbCost] = useState<string>("");
  const [afterRefurbValue, setAfterRefurbValue] = useState<string>("");
  const [monthlyRent, setMonthlyRent] = useState<string>("");
  const [refinancePercent, setRefinancePercent] = useState<string>("75");
  const [brrResult, setBRRResult] = useState<BRRCalculation | null>(null);

  // Construction Costs State
  const [selectedRegion, setSelectedRegion] = useState<string>("North West");
  const [propertySize, setPropertySize] = useState<string>("100");
  const [refurbLevel, setRefurbLevel] = useState<string>("medium");

  // Live construction cost data by region
  const constructionCosts: ConstructionCosts[] = [
    {
      region: "London",
      basicRefurb: 850,
      mediumRefurb: 1200,
      highEndRefurb: 1800,
      extension: 2200,
      loftConversion: 1500,
      kitchenFull: 15000,
      bathroomFull: 8000
    },
    {
      region: "South East",
      basicRefurb: 650,
      mediumRefurb: 950,
      highEndRefurb: 1400,
      extension: 1800,
      loftConversion: 1200,
      kitchenFull: 12000,
      bathroomFull: 6500
    },
    {
      region: "North West",
      basicRefurb: 450,
      mediumRefurb: 650,
      highEndRefurb: 950,
      extension: 1200,
      loftConversion: 800,
      kitchenFull: 8000,
      bathroomFull: 4500
    },
    {
      region: "North East",
      basicRefurb: 400,
      mediumRefurb: 580,
      highEndRefurb: 850,
      extension: 1100,
      loftConversion: 750,
      kitchenFull: 7000,
      bathroomFull: 4000
    },
    {
      region: "Yorkshire",
      basicRefurb: 420,
      mediumRefurb: 600,
      highEndRefurb: 880,
      extension: 1150,
      loftConversion: 780,
      kitchenFull: 7500,
      bathroomFull: 4200
    },
    {
      region: "Midlands",
      basicRefurb: 480,
      mediumRefurb: 680,
      highEndRefurb: 1000,
      extension: 1250,
      loftConversion: 850,
      kitchenFull: 8500,
      bathroomFull: 4800
    },
    {
      region: "South West",
      basicRefurb: 580,
      mediumRefurb: 820,
      highEndRefurb: 1200,
      extension: 1600,
      loftConversion: 1000,
      kitchenFull: 10000,
      bathroomFull: 5500
    }
  ];

  // Value-add opportunities based on property characteristics
  const valueAddOpportunities: ValueAddOpportunity[] = [
    {
      type: "Loft Conversion",
      description: "Convert loft space to additional bedroom with ensuite",
      costEstimate: 25000,
      valueIncrease: 45000,
      timeframe: "6-8 weeks",
      complexity: "Medium",
      roi: 80
    },
    {
      type: "Rear Extension",
      description: "Single-story rear extension for kitchen/dining space",
      costEstimate: 35000,
      valueIncrease: 50000,
      timeframe: "8-12 weeks",
      complexity: "High",
      roi: 43
    },
    {
      type: "HMO Conversion",
      description: "Convert 3-bed house to 5-bed HMO with ensuite bathrooms",
      costEstimate: 40000,
      valueIncrease: 30000,
      timeframe: "10-14 weeks",
      complexity: "High",
      roi: 150
    },
    {
      type: "Basement Conversion",
      description: "Convert basement to additional living space/bedroom",
      costEstimate: 50000,
      valueIncrease: 70000,
      timeframe: "12-16 weeks",
      complexity: "High",
      roi: 40
    },
    {
      type: "Garage Conversion",
      description: "Convert garage to additional bedroom or office space",
      costEstimate: 12000,
      valueIncrease: 18000,
      timeframe: "3-4 weeks",
      complexity: "Low",
      roi: 50
    },
    {
      type: "Kitchen Extension",
      description: "Side return extension for larger kitchen/dining area",
      costEstimate: 45000,
      valueIncrease: 65000,
      timeframe: "10-14 weeks",
      complexity: "High",
      roi: 44
    }
  ];

  // Calculate BRR Strategy
  const calculateBRR = () => {
    const purchase = parseFloat(purchasePrice) || 0;
    const refurb = parseFloat(refurbCost) || 0;
    const arv = parseFloat(afterRefurbValue) || 0;
    const rent = parseFloat(monthlyRent) || 0;
    const refinanceRate = parseFloat(refinancePercent) / 100;

    const totalInvested = purchase + refurb;
    const refinanceAmount = arv * refinanceRate;
    const cashLeft = Math.max(0, totalInvested - refinanceAmount);
    const instantEquity = arv - totalInvested;
    const monthlyProfit = rent - (refinanceAmount * 0.045 / 12) - (rent * 0.2); // Rough mortgage + expenses

    const result: BRRCalculation = {
      purchasePrice: purchase,
      refurbCost: refurb,
      refinanceValue: arv,
      totalInvested,
      cashLeft,
      instantEquity,
      monthlyRent: rent,
      monthlyProfit,
      totalROI: totalInvested > 0 ? (instantEquity / totalInvested) * 100 : 0,
      cashOnCashReturn: cashLeft > 0 ? (monthlyProfit * 12 / cashLeft) * 100 : 0
    };

    setBRRResult(result);
  };

  // Get construction costs for selected region
  const getConstructionCosts = () => {
    return constructionCosts.find(cost => cost.region === selectedRegion) || constructionCosts[2];
  };

  const currentCosts = getConstructionCosts();
  const size = parseFloat(propertySize) || 100;
  
  let costPerSqM = currentCosts.basicRefurb;
  if (refurbLevel === "medium") costPerSqM = currentCosts.mediumRefurb;
  if (refurbLevel === "high") costPerSqM = currentCosts.highEndRefurb;
  
  const totalRefurbCost = Math.round(costPerSqM * size);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', color: '#000' }}>
      <NavigationBar currentPage="Developer Tools" pageIcon="🏗️" />
      
      {/* Main content */}
      <div className="main-content" style={{ flex: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32, color: '#000' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🏗️ Property Developer Tools
          </h1>
          <p style={{ color: '#6b7280', fontSize: 16 }}>Advanced analytics for buy, refurbish, refinance strategies</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* BRR Calculator */}
          <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              🔄 BRR Calculator
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Purchase Price</label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="150000"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    background: '#fff'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Refurbishment Cost</label>
                <input
                  type="number"
                  value={refurbCost}
                  onChange={(e) => setRefurbCost(e.target.value)}
                  placeholder="25000"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    background: '#fff'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>After Refurb Value (ARV)</label>
                <input
                  type="number"
                  value={afterRefurbValue}
                  onChange={(e) => setAfterRefurbValue(e.target.value)}
                  placeholder="200000"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    background: '#fff'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Monthly Rent</label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder="1200"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    background: '#fff'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Refinance % (LTV)</label>
                <select
                  value={refinancePercent}
                  onChange={(e) => setRefinancePercent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    background: '#fff'
                  }}
                >
                  <option value="70">70%</option>
                  <option value="75">75%</option>
                  <option value="80">80%</option>
                </select>
              </div>
              
              <button
                onClick={calculateBRR}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                }}
              >
                Calculate BRR Strategy
              </button>
            </div>
            
            {/* BRR Results */}
            {brrResult && (
              <div style={{ marginTop: 24, padding: 20, background: 'rgba(16,185,129,0.1)', borderRadius: 12 }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>BRR Analysis Results</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                  <div><strong>Total Invested:</strong> £{brrResult.totalInvested.toLocaleString()}</div>
                  <div><strong>Cash Left In:</strong> £{brrResult.cashLeft.toLocaleString()}</div>
                  <div><strong>Instant Equity:</strong> £{brrResult.instantEquity.toLocaleString()}</div>
                  <div><strong>Monthly Profit:</strong> £{brrResult.monthlyProfit.toFixed(0)}</div>
                  <div><strong>Total ROI:</strong> {brrResult.totalROI.toFixed(1)}%</div>
                  <div><strong>Cash-on-Cash Return:</strong> {brrResult.cashOnCashReturn.toFixed(1)}%</div>
                </div>
                
                <div style={{ 
                  marginTop: 16, 
                  padding: 12, 
                  background: brrResult.cashLeft < brrResult.totalInvested * 0.2 ? '#10b981' : '#f59e0b',
                  color: '#fff',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 600
                }}>
                  {brrResult.cashLeft < brrResult.totalInvested * 0.2 ? 
                    "✅ Excellent BRR Deal - Most capital recycled!" : 
                    "⚠️ Consider negotiating purchase price or ARV"
                  }
                </div>
              </div>
            )}
          </div>

          {/* Construction Cost Estimator */}
          <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              💰 Live Construction Costs
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    background: '#fff'
                  }}
                >
                  {constructionCosts.map(cost => (
                    <option key={cost.region} value={cost.region}>{cost.region}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Property Size (sq m)</label>
                <input
                  type="number"
                  value={propertySize}
                  onChange={(e) => setPropertySize(e.target.value)}
                  placeholder="100"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    background: '#fff'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Refurb Level</label>
                <select
                  value={refurbLevel}
                  onChange={(e) => setRefurbLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    background: '#fff'
                  }}
                >
                  <option value="basic">Basic (£{currentCosts.basicRefurb}/sq m)</option>
                  <option value="medium">Medium (£{currentCosts.mediumRefurb}/sq m)</option>
                  <option value="high">High-End (£{currentCosts.highEndRefurb}/sq m)</option>
                </select>
              </div>
            </div>
            
            {/* Cost Breakdown */}
            <div style={{ padding: 20, background: 'rgba(102,126,234,0.1)', borderRadius: 12 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>Cost Estimate for {selectedRegion}</h3>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea', marginBottom: 16 }}>
                £{totalRefurbCost.toLocaleString()}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                <div><strong>Cost per sq m:</strong> £{costPerSqM}</div>
                <div><strong>Property size:</strong> {propertySize} sq m</div>
              </div>
              
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(102,126,234,0.2)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600 }}>Individual Room Costs:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div>Full Kitchen: £{currentCosts.kitchenFull.toLocaleString()}</div>
                  <div>Full Bathroom: £{currentCosts.bathroomFull.toLocaleString()}</div>
                  <div>Extension: £{currentCosts.extension}/sq m</div>
                  <div>Loft Conversion: £{currentCosts.loftConversion}/sq m</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Value-Add Opportunities Scanner */}
        <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            🎯 Value-Add Opportunity Scanner
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
            {valueAddOpportunities.map((opportunity, index) => (
              <div key={opportunity.type} style={{ 
                background: opportunity.roi > 60 ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)' : 'rgba(102,126,234,0.05)',
                borderRadius: 12,
                padding: 20,
                border: opportunity.roi > 60 ? '2px solid rgba(16,185,129,0.3)' : '1px solid rgba(102,126,234,0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{opportunity.type}</h3>
                  <div style={{ 
                    background: opportunity.roi > 60 ? '#10b981' : opportunity.roi > 40 ? '#0ea5e9' : '#f59e0b',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {opportunity.roi}% ROI
                  </div>
                </div>
                
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                  {opportunity.description}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                  <div>
                    <div style={{ color: '#9ca3af', marginBottom: 2 }}>Cost Estimate</div>
                    <div style={{ fontWeight: 600 }}>£{opportunity.costEstimate.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: '#9ca3af', marginBottom: 2 }}>Value Increase</div>
                    <div style={{ fontWeight: 600, color: '#10b981' }}>£{opportunity.valueIncrease.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: '#9ca3af', marginBottom: 2 }}>Timeframe</div>
                    <div style={{ fontWeight: 600 }}>{opportunity.timeframe}</div>
                  </div>
                  <div>
                    <div style={{ color: '#9ca3af', marginBottom: 2 }}>Complexity</div>
                    <div style={{ 
                      fontWeight: 600,
                      color: opportunity.complexity === 'Low' ? '#10b981' : 
                             opportunity.complexity === 'Medium' ? '#f59e0b' : '#ef4444'
                    }}>
                      {opportunity.complexity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BMV Opportunities */}
        <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            💎 BMV Deal Scanner
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)', borderRadius: 12, padding: 20, border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: 14, color: '#059669', fontWeight: 600, marginBottom: 4 }}>🏛️ AUCTION PROPERTIES</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#000', marginBottom: 8 }}>15-25% Discount</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Medium risk • 28-45 days completion</div>
            </div>
            
            <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)', borderRadius: 12, padding: 20, border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ fontSize: 14, color: '#2563eb', fontWeight: 600, marginBottom: 4 }}>⚰️ PROBATE SALES</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#000', marginBottom: 8 }}>10-20% Discount</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Low risk • 45-90 days completion</div>
            </div>
            
            <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)', borderRadius: 12, padding: 20, border: '1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ fontSize: 14, color: '#d97706', fontWeight: 600, marginBottom: 4 }}>🚨 DISTRESSED SALES</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#000', marginBottom: 8 }}>20-35% Discount</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>High risk • 14-30 days completion</div>
            </div>
            
            <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.05) 100%)', borderRadius: 12, padding: 20, border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ fontSize: 14, color: '#7c3aed', fontWeight: 600, marginBottom: 4 }}>🏦 REPOSSESSIONS</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#000', marginBottom: 8 }}>15-30% Discount</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Medium risk • 21-42 days completion</div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(102,126,234,0.1)', borderRadius: 8 }}>
            <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#6b7280' }}>
              🎯 <strong>2,340 BMV properties</strong> currently available nationwide
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
              Average discount: <strong>18.5%</strong> • Best regions: North East, Midlands, Yorkshire
            </p>
          </div>
        </div>

        {/* Planning Permission Insights */}
        <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            📋 Planning Permission Intelligence
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Success Rates by Development Type</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { type: "Loft Conversions", rate: 91.8, days: 38 },
                  { type: "Rear Extensions", rate: 89.5, days: 45 },
                  { type: "Side Extensions", rate: 86.3, days: 48 },
                  { type: "Change of Use", rate: 76.2, days: 65 }
                ].map((item) => (
                  <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ minWidth: 120, fontSize: 14, fontWeight: 500 }}>{item.type}</div>
                    <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${item.rate}%`, 
                        height: '100%', 
                        background: item.rate > 85 ? '#10b981' : item.rate > 75 ? '#f59e0b' : '#ef4444',
                        borderRadius: 3
                      }}></div>
                    </div>
                    <div style={{ minWidth: 50, fontSize: 14, fontWeight: 600, color: '#10b981' }}>{item.rate}%</div>
                    <div style={{ minWidth: 60, fontSize: 12, color: '#6b7280' }}>{item.days} days</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Quick Tips</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: 12, background: 'rgba(16,185,129,0.1)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>✅ PERMITTED DEVELOPMENT</div>
                  <p style={{ fontSize: 11, margin: '4px 0 0 0', color: '#6b7280' }}>Check PD rights first - could save 8-12 weeks</p>
                </div>
                <div style={{ padding: 12, background: 'rgba(245,158,11,0.1)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#d97706' }}>⚠️ CONSERVATION AREAS</div>
                  <p style={{ fontSize: 11, margin: '4px 0 0 0', color: '#6b7280' }}>Additional restrictions apply - check first</p>
                </div>
                <div style={{ padding: 12, background: 'rgba(59,130,246,0.1)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>💡 PRE-APPLICATION</div>
                  <p style={{ fontSize: 11, margin: '4px 0 0 0', color: '#6b7280' }}>Book consultation for complex projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              🔍 Find Properties
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
              🧮 Basic Calculator
            </button>
          </Link>
          <button
            onClick={() => window.open('/api/bmv-opportunities', '_blank')}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '16px 32px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            💎 Live BMV Data
          </button>
        </div>
      </div>
    </div>
  );
}
