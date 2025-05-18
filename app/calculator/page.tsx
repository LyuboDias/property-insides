"use client";
import Link from "next/link";
import { useState } from "react";

const toCurrency = (n: number) => `£${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const toPercent = (n: number) => `${(n * 100).toFixed(2)}%`;

export default function Calculator() {
  // Inputs as strings to avoid leading zero
  const [address, setAddress] = useState("");
  const [postCode, setPostCode] = useState("");
  const [cash, setCash] = useState("");
  const [purchase, setPurchase] = useState("");
  const [repair, setRepair] = useState("");
  const [rent, setRent] = useState("");
  const [legal, setLegal] = useState("1000");
  const [mortgageFees, setMortgageFees] = useState("2000");
  const [mortgageRate, setMortgageRate] = useState("5.0");
  const [maxLtv, setMaxLtv] = useState("75");
  const [rentalCover, setRentalCover] = useState("150");
  const [stressRate, setStressRate] = useState("8.0");
  // New fields
  const [depositOverride, setDepositOverride] = useState("");
  const [agencyFee, setAgencyFee] = useState(""); // percent
  const [additionalFees, setAdditionalFees] = useState("");

  // Results state
  const [results, setResults] = useState<any | null>(null);

  // Calculate handler
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const cashNum = Number(cash) || 0;
    const purchaseNum = Number(purchase) || 0;
    const repairNum = Number(repair) || 0;
    const rentNum = Number(rent) || 0;
    const legalNum = Number(legal) || 0;
    const mortgageFeesNum = Number(mortgageFees) || 0;
    const mortgageRateNum = Number(mortgageRate) || 0;
    const maxLtvNum = Number(maxLtv) || 0;
    const rentalCoverNum = Number(rentalCover) || 0;
    const stressRateNum = Number(stressRate) || 0;
    const depositOverrideNum = Number(depositOverride);
    const agencyFeePercent = Number(agencyFee) || 0;
    const agencyFeeValue = rentNum * (agencyFeePercent / 100);
    const additionalFeesNum = Number(additionalFees) || 0;

    // Use user deposit if provided, otherwise calculate
    const deposit = !isNaN(depositOverrideNum) && depositOverride !== "" ? depositOverrideNum : purchaseNum * (maxLtvNum ? (1 - maxLtvNum / 100) : 0);
    const fees = legalNum + mortgageFeesNum;
    const totalInvestment = deposit + repairNum + fees;
    const mortgage = purchaseNum - deposit;
    const ltv = purchaseNum ? mortgage / purchaseNum : 0;
    const rentalCoverValue = mortgage ? (rentNum * 12) / (mortgage * (stressRateNum / 100)) : 0;
    const mortgageInterest = mortgage * (mortgageRateNum / 100) / 12;
    const expenses = agencyFeeValue + additionalFeesNum;
    const profit = rentNum - mortgageInterest - expenses;
    const roi = totalInvestment ? (profit * 12) / totalInvestment : 0;
    const yieldValue = purchaseNum ? (rentNum * 12) / purchaseNum : 0;
    const stampDuty = 0; // TODO: Implement actual SDLT calculation for second home
    setResults({
      stampDuty,
      deposit,
      repair: repairNum,
      fees,
      totalInvestment,
      mortgage,
      ltv,
      rentalCoverValue,
      rent: rentNum,
      mortgageInterest,
      expenses,
      agencyFee: agencyFeeValue,
      additionalFees: additionalFeesNum,
      profit,
      roi,
      yieldValue,
    });
  };

  // Download results as CSV
  const handleDownload = () => {
    if (!results) return;
    let csv = '';
    if (address || postCode) {
      csv += `"${address}${address && postCode ? ', ' : ''}${postCode}"
`;
    }
    const rows = [
      ['Stamp duty (SDLT with second home)', results.stampDuty],
      ['Deposit', results.deposit],
      ['Repair costs', results.repair],
      ['Fees', results.fees],
      ['Total investment', results.totalInvestment],
      ['Mortgage', results.mortgage],
      ['LTV', results.ltv],
      ['Rental cover', results.rentalCoverValue],
      ['Rent (per month)', results.rent],
      ['Mortgage interest (per month)', results.mortgageInterest],
      ['Agency fee (per month)', results.agencyFee],
      ['Additional monthly fees', results.additionalFees],
      ['Expenses (per month, estimated)', results.expenses],
      ['Profit per month', results.profit],
      ['ROI', results.roi],
      ['Yield', results.yieldValue],
    ];
    csv += rows.map(([k, v]) => `"${k}","${typeof v === 'number' ? v : ''}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deal-results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex', color: '#000' }}>
      {/* Sidebar */}
      <aside style={{ width: 320, background: '#fff', borderRight: '1px solid #e5e7eb', minHeight: '100vh', padding: '40px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 32, boxShadow: '2px 0 8px rgba(0,0,0,0.04)', color: '#000' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: '#000' }}>Buy-to-let deal analyser spreadsheet</h1>
          <Link href="/" style={{ color: '#0070f3', fontWeight: 500, fontSize: 15, textDecoration: 'underline' }}>Home</Link>
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#000' }}>Instructions</h2>
          <ul style={{ color: '#000', fontSize: 14, paddingLeft: 18, margin: 0, lineHeight: 1.7 }}>
            <li>Enter your deal numbers</li>
            <li>Hit the calculate button</li>
            <li>Adjust the values to compare deal results</li>
            <li>Download the spreadsheet if you like</li>
          </ul>
        </div>
      </aside>
      {/* Main content */}
      <div style={{ flex: 1, padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#000' }}>
        <form onSubmit={handleCalculate} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 24, width: '100%', maxWidth: 1200, marginBottom: 32, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, color: '#000' }}>
          {/* Address and Post Code fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Post Code</label>
            <input type="text" value={postCode} onChange={e => setPostCode(e.target.value)} style={inputStyle} />
          </div>
          <div />
          {/* Existing fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Cash available</label>
            <input type="number" value={cash} onChange={e => setCash(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Purchase price</label>
            <input type="number" value={purchase} onChange={e => setPurchase(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Repair cost</label>
            <input type="number" value={repair} onChange={e => setRepair(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Forecast rent (per month)</label>
            <input type="number" value={rent} onChange={e => setRent(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Legal fees</label>
            <input type="number" value={legal} onChange={e => setLegal(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Mortgage fees</label>
            <input type="number" value={mortgageFees} onChange={e => setMortgageFees(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Mortgage rate (%)</label>
            <input type="number" value={mortgageRate} step="0.01" onChange={e => setMortgageRate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Max LTV (%)</label>
            <input type="number" value={maxLtv} step="0.01" onChange={e => setMaxLtv(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Rental cover required (%)</label>
            <input type="number" value={rentalCover} step="0.01" onChange={e => setRentalCover(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Stress rate (%)</label>
            <input type="number" value={stressRate} step="0.01" onChange={e => setStressRate(e.target.value)} style={inputStyle} />
          </div>
          {/* New fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Deposit (override, optional)</label>
            <input type="number" value={depositOverride} onChange={e => setDepositOverride(e.target.value)} style={inputStyle} placeholder="Leave blank to auto-calculate" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Agency fee (% of rent per month)</label>
            <input type="number" value={agencyFee} onChange={e => setAgencyFee(e.target.value)} style={inputStyle} placeholder="e.g. 10 for 10%" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Additional monthly fees</label>
            <input type="number" value={additionalFees} onChange={e => setAdditionalFees(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
            <button type="submit" style={buttonStyle}>Calculate</button>
          </div>
        </form>
        {results && (
          <div style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb', padding: 24, maxWidth: 900, width: '100%', color: '#000' }}>
            {/* Address and Post Code as title */}
            {(address || postCode) && (
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16, color: '#000' }}>
                {address}{address && postCode ? ", " : ""}{postCode}
              </div>
            )}
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                <tr><th style={thStyle}>Stamp duty (SDLT with second home)</th><td style={tdStyle}>{toCurrency(results.stampDuty)}</td></tr>
                <tr><th style={thStyle}>Deposit</th><td style={tdStyle}>{toCurrency(results.deposit)}</td></tr>
                <tr><th style={thStyle}>Repair costs</th><td style={tdStyle}>{toCurrency(results.repair)}</td></tr>
                <tr><th style={thStyle}>Fees</th><td style={tdStyle}>{toCurrency(results.fees)}</td></tr>
                <tr><th style={thStyle}>Total investment</th><td style={tdStyle}>{toCurrency(results.totalInvestment)}</td></tr>
                <tr><th style={thStyle}>Mortgage</th><td style={tdStyle}>{toCurrency(results.mortgage)}</td></tr>
                <tr><th style={thStyle}>LTV</th><td style={tdStyle}>{toPercent(results.ltv)}</td></tr>
                <tr><th style={thStyle}>Rental cover</th><td style={tdStyle}>{toPercent(results.rentalCoverValue)}</td></tr>
                <tr><th style={thStyle}>Rent (per month)</th><td style={tdStyle}>{toCurrency(results.rent)}</td></tr>
                <tr><th style={thStyle}>Mortgage interest (per month)</th><td style={tdStyle}>{toCurrency(results.mortgageInterest)}</td></tr>
                <tr><th style={thStyle}>Agency fee (per month)</th><td style={tdStyle}>{toCurrency(results.agencyFee)}</td></tr>
                <tr><th style={thStyle}>Additional monthly fees</th><td style={tdStyle}>{toCurrency(results.additionalFees)}</td></tr>
                <tr><th style={thStyle}>Expenses (per month, estimated)</th><td style={tdStyle}>{toCurrency(results.expenses)}</td></tr>
                <tr><th style={thStyle}>Profit per month</th><td style={tdStyle}>{toCurrency(results.profit)}</td></tr>
                <tr><th style={thStyle}>ROI</th><td style={tdStyle}>{toPercent(results.roi)}</td></tr>
                <tr><th style={thStyle}>Yield</th><td style={tdStyle}>{toPercent(results.yieldValue)}</td></tr>
              </tbody>
            </table>
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button type="button" style={buttonStyle} onClick={handleDownload}>Download Results</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  background: '#f4f6fa',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  padding: '8px 10px',
  fontSize: 15,
  color: '#222',
  outline: 'none',
  fontWeight: 400,
  marginTop: 2,
  marginBottom: 2,
  transition: 'border 0.2s',
};

const buttonStyle = {
  background: '#0070f3',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '10px 28px',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  marginTop: 8,
};

const thStyle = {
  textAlign: 'left' as const,
  fontWeight: 600,
  padding: '8px 10px',
  background: 'transparent',
  color: '#222',
  borderBottom: '1px solid #e5e7eb',
};

const tdStyle = {
  textAlign: 'right' as const,
  fontWeight: 400,
  padding: '8px 10px',
  background: 'transparent',
  color: '#222',
  borderBottom: '1px solid #e5e7eb',
}; 