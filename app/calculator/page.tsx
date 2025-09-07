"use client";
import Link from "next/link";
import { useState } from "react";

const toCurrency = (n: number | undefined | null) =>
  typeof n === "number" && !isNaN(n)
    ? `£${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "£0.00";
const toPercent = (n: number) => `${(n * 100).toFixed(2)}%`;

// SDLT calculation for LTD/second home (England, buy-to-let)
function calculateStampDuty(purchasePrice: number): number {
  if (purchasePrice <= 40000) return 0;
  let sdlt = 0;
  if (purchasePrice > 1500000) {
    sdlt += (purchasePrice - 1500000) * 0.15;
    purchasePrice = 1500000;
  }
  if (purchasePrice > 925000) {
    sdlt += (purchasePrice - 925000) * 0.13;
    purchasePrice = 925000;
  }
  if (purchasePrice > 250000) {
    sdlt += (purchasePrice - 250000) * 0.08;
    purchasePrice = 250000;
  }
  if (purchasePrice > 0) {
    sdlt += purchasePrice * 0.03;
  }
  return sdlt;
}

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
  const [mortgageTerm, setMortgageTerm] = useState("25");
  const [mortgageType, setMortgageType] = useState("interestOnly"); // 'interestOnly' or 'repayment'
  const [maxLtv, setMaxLtv] = useState("75");
  const [rentalCover, setRentalCover] = useState("150");
  const [stressRate, setStressRate] = useState("8.0");
  // New fields
  const [depositOverride, setDepositOverride] = useState("");
  const [agencyFee, setAgencyFee] = useState(""); // percent
  const [additionalFees, setAdditionalFees] = useState("");
  const [dateAdded, setDateAdded] = useState("");
  const [link, setLink] = useState("");
  const [numBeds, setNumBeds] = useState("");
  const [soldDate, setSoldDate] = useState("");
  const [soldPrice, setSoldPrice] = useState("");
  const [comment, setComment] = useState("");
  const [insurance, setInsurance] = useState("");
  const [growth, setGrowth] = useState("");

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
    const insuranceNum = Number(insurance) || 0;

    // Use user deposit if provided, otherwise calculate
    const deposit = !isNaN(depositOverrideNum) && depositOverride !== "" ? depositOverrideNum : purchaseNum * (maxLtvNum ? (1 - maxLtvNum / 100) : 0);
    const fees = legalNum + mortgageFeesNum;
    const stampDuty = calculateStampDuty(purchaseNum);
    const totalInvestment = deposit + repairNum + legalNum + mortgageFeesNum + stampDuty;
    const mortgage = purchaseNum - deposit;
    const ltv = purchaseNum ? mortgage / purchaseNum : 0;
    const rentalCoverValue = mortgage ? (rentNum * 12) / (mortgage * (stressRateNum / 100)) : 0;
    let mortgageInterest = 0;
    if (mortgageType === 'interestOnly') {
      mortgageInterest = mortgage * (mortgageRateNum / 100) / 12;
    } else {
      // Repayment mortgage formula
      const principal = mortgage;
      const monthlyRate = mortgageRateNum / 100 / 12;
      const numPayments = Number(mortgageTerm) * 12;
      if (monthlyRate > 0 && numPayments > 0) {
        mortgageInterest = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      } else {
        mortgageInterest = 0;
      }
    }
    const expenses = agencyFeeValue + additionalFeesNum;
    const currentValue = soldPrice ? Number(soldPrice) : purchaseNum;
    const growthRate = Number(growth) ? Number(growth) / 100 : 0;
    const valueAfter2Years = currentValue * Math.pow(1 + growthRate, 2);
    const valueAfter5Years = currentValue * Math.pow(1 + growthRate, 5);
    const annualRent = rentNum * 12;
    const annualExpenses =
      (mortgageInterest * 12) +
      (agencyFeeValue * 12) +
      (additionalFeesNum * 12) +
      insuranceNum; // Already an annual value
      const annualNetProfit = annualRent - annualExpenses;
    const monthlyNetProfit = annualNetProfit / 12;
    const monthlyExpenses = (annualExpenses - insuranceNum) / 12;
    // TODO fix the ROI calculation
    const roi = totalInvestment ? (annualNetProfit / totalInvestment) * 100 : 0;

    // Extended ROI: Include 5-year capital gain
    const capitalGain = valueAfter5Years - purchaseNum;
    const totalProfit5Years = (annualNetProfit * 5) + capitalGain;
    const roi5Year = totalInvestment ? (totalProfit5Years / totalInvestment) * 100 : 0;

    // const roi = totalInvestment ? (annualNetProfit / totalInvestment) * 100 : 0;
    const yieldValue = purchaseNum ? annualRent / purchaseNum : 0;
    // GROSS YIELD: (Annual Rental Income / Property Value) * 100
    const grossYield = purchaseNum ? (annualRent / purchaseNum) * 100 : 0;
    // NET YIELD: ((Annual Rental Income - Annual Expenses) / Property Value) * 100
    const netYield = purchaseNum ? ((annualRent - annualExpenses) / purchaseNum) * 100 : 0;
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
      annualRent,
      mortgageInterest,
      expenses,
      agencyFee: agencyFeeValue,
      additionalFees: additionalFeesNum,
      profit: rentNum - mortgageInterest - expenses,
      roi,
      roi5Year,
      capitalGain,
      yieldValue,
      grossYield,
      netYield,
      dateAdded,
      link,
      numBeds,
      soldDate,
      soldPrice,
      comment,
      insurance,
      valueAfter2Years,
      valueAfter5Years,
      growth,
      mortgageType,
      annualExpenses,
      annualNetProfit,
      monthlyNetProfit,
      monthlyExpenses,
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
      ["Date added", results.dateAdded],
      ["Days since added", results.dateAdded ? Math.floor((Date.now() - new Date(results.dateAdded).getTime()) / (1000 * 60 * 60 * 24)) : ""],
      ["Link", results.link],
      ["No of beds", results.numBeds],
      ["Sold date", results.soldDate],
      ["Sold price", results.soldPrice],
      ["Insurance", results.insurance],
      ["Comment/notes", results.comment],
      ['Stamp duty (SDLT with second home)', results.stampDuty],
      ['Deposit', results.deposit],
      ['Repair costs', results.repair],
      ['Fees', results.fees],
      ['Total investment', results.totalInvestment],
      ['Mortgage', results.mortgage],
      ['LTV', results.ltv],
      ['Rental cover', results.rentalCoverValue],
      ['Rent (per month)', results.rent],
      ['Annual rent income', results.annualRent],
      ['Mortgage interest (per month)', results.mortgageInterest],
      ['Agency fee (per month)', results.agencyFee],
      ['Additional monthly fees', results.additionalFees],
      ['Expenses (per month, estimated)', results.monthlyExpenses],
      ['Profit per month', results.monthlyNetProfit],
      ['ROI', results.roi],
      ['Yield', results.yieldValue],
      ['Gross yield (%)', results.grossYield.toFixed(2) + '%'],
      ['Net yield (%)', results.netYield.toFixed(2) + '%'],
      ['Estimated value after 2 years', results.valueAfter2Years],
      ['Estimated value after 5 years', results.valueAfter5Years],
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
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Deal Calculator</h1>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>Analyze your buy-to-let investments</p>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: 14, padding: '8px 12px', borderRadius: 6, transition: 'all 0.2s' }}>
              🏠 Home
            </Link>
            <Link href="/calculator" style={{ color: '#0070f3', textDecoration: 'none', fontSize: 14, padding: '8px 12px', borderRadius: 6, background: '#f0f8ff', fontWeight: 500 }}>
              🧮 Calculator
            </Link>
            <Link href="/checklist" style={{ color: '#666', textDecoration: 'none', fontSize: 14, padding: '8px 12px', borderRadius: 6, transition: 'all 0.2s' }}>
              ✅ Checklist
            </Link>
            <Link href="/property-search" style={{ color: '#666', textDecoration: 'none', fontSize: 14, padding: '8px 12px', borderRadius: 6, transition: 'all 0.2s' }}>
              🔍 Property Search
            </Link>
          </nav>
        </div>
      </aside>
      {/* Main content */}
      <div style={{ flex: 1, padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#000' }}>
        <form onSubmit={handleCalculate} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 24, width: '100%', maxWidth: 1200, marginBottom: 32, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, color: '#000' }}>
          {/* Property Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Address <span style={{ color: 'red' }}>*</span></label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Post Code <span style={{ color: 'red' }}>*</span></label>
            <input type="text" value={postCode} onChange={e => setPostCode(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Link <span style={{ color: 'red' }}>*</span></label>
            <input type="url" value={link} onChange={e => setLink(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Date added <span style={{ color: 'red' }}>*</span></label>
            <input type="date" value={dateAdded} onChange={e => setDateAdded(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>No of beds <span style={{ color: 'red' }}>*</span></label>
            <input type="number" value={numBeds} onChange={e => setNumBeds(e.target.value)} style={inputStyle} required />
          </div>

          {/* Transaction Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Purchase price <span style={{ color: 'red' }}>*</span></label>
            <input type="number" value={purchase} onChange={e => setPurchase(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Sold date</label>
            <input type="date" value={soldDate} onChange={e => setSoldDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Sold price</label>
            <input type="number" value={soldPrice} onChange={e => setSoldPrice(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Cash available</label>
            <input type="number" value={cash} onChange={e => setCash(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Repair cost</label>
            <input type="number" value={repair} onChange={e => setRepair(e.target.value)} style={inputStyle} />
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
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Insurance</label>
            <input type="number" value={insurance} onChange={e => setInsurance(e.target.value)} style={inputStyle} />
          </div>

          {/* Rental Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Forecast rent (per month) <span style={{ color: 'red' }}>*</span></label>
            <input type="number" value={rent} onChange={e => setRent(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Agency fee (% of rent per month)</label>
            <input type="number" value={agencyFee} onChange={e => setAgencyFee(e.target.value)} style={inputStyle} placeholder="e.g. 10 for 10%" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Additional monthly fees</label>
            <input type="number" value={additionalFees} onChange={e => setAdditionalFees(e.target.value)} style={inputStyle} />
          </div>

          {/* Mortgage Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Mortgage rate (%)</label>
            <input type="number" value={mortgageRate} step="0.01" onChange={e => setMortgageRate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Term (years)</label>
            <input type="number" value={mortgageTerm} min="1" max="40" onChange={e => setMortgageTerm(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Mortgage type</label>
            <select value={mortgageType} onChange={e => setMortgageType(e.target.value)} style={inputStyle}>
              <option value="interestOnly">Interest Only</option>
              <option value="repayment">Repayment</option>
            </select>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Deposit (override, optional)</label>
            <input type="number" value={depositOverride} onChange={e => setDepositOverride(e.target.value)} style={inputStyle} placeholder="Leave blank to auto-calculate" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Expected property growth (%)</label>
            <input type="number" value={growth} onChange={e => setGrowth(e.target.value)} style={inputStyle} placeholder="e.g. 3 for 3% per year" />
          </div>

          {/* Notes/Comments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Comment/notes</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} style={inputStyle} rows={2} />
          </div>
          <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
            <button type="submit" style={buttonStyle}>Calculate</button>
          </div>
        </form>
        {results && (
          <div style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb', padding: 24, maxWidth: 900, width: '100%', color: '#000' }}>
            {/* Address and Post Code as title */}
            {(address || postCode) && (
              <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 16, color: '#000' }}>
                {address.toUpperCase()}{address && postCode ? " - " : ""}{postCode.toUpperCase()}
              </div>
            )}
            {Number(cash) < results.totalInvestment && (
              <div style={{ color: 'red', fontWeight: 600, marginBottom: 16, fontSize: 16 }}>
                Warning: Your available cash ({toCurrency(Number(cash))}) is less than the total investment required ({toCurrency(results.totalInvestment)}).
              </div>
            )}
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                {results.dateAdded && (
                  <tr><th style={thStyle}>Date added</th><td style={tdStyle}>{results.dateAdded}</td></tr>
                )}
                {results.dateAdded && (
                  <tr><th style={thStyle}>Days since added</th><td style={tdStyle}>{Math.floor((Date.now() - new Date(results.dateAdded).getTime()) / (1000 * 60 * 60 * 24))}</td></tr>
                )}
                {results.link && (
                  <tr><th style={thStyle}>Link</th><td style={tdStyle}><a href={results.link} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>{results.link}</a></td></tr>
                )}
                {results.numBeds && (
                  <tr><th style={thStyle}>No of beds</th><td style={tdStyle}>{results.numBeds}</td></tr>
                )}
                {results.soldDate && (
                  <tr><th style={thStyle}>Sold date</th><td style={tdStyle}>{results.soldDate}</td></tr>
                )}
                {results.soldPrice && (
                  <tr><th style={thStyle}>Sold price</th><td style={tdStyle}>{toCurrency(Number(results.soldPrice))}</td></tr>
                )}
                {results.insurance && (
                  <tr><th style={thStyle}>Insurance</th><td style={tdStyle}>{toCurrency(Number(results.insurance))}</td></tr>
                )}
                {results.comment && (
                  <tr><th style={thStyle}>Comment/notes</th><td style={tdStyle}>{results.comment}</td></tr>
                )}
                <tr><th style={thStyle}>Stamp duty</th><td style={tdStyle}>{toCurrency(results.stampDuty)}</td></tr>
                <tr><th style={thStyle}>Deposit</th><td style={tdStyle}>{toCurrency(results.deposit)}</td></tr>
                <tr><th style={thStyle}>Repair costs</th><td style={tdStyle}>{toCurrency(results.repair)}</td></tr>
                <tr><th style={thStyle}>Bank Fees</th><td style={tdStyle}>{toCurrency(results.fees)}</td></tr>
                <tr><th style={thStyle}>Total investment</th><td style={tdStyle}>{toCurrency(results.totalInvestment)}</td></tr>
                <tr><th style={thStyle}>Mortgage Amount</th><td style={tdStyle}>{toCurrency(results.mortgage)}</td></tr>
                <tr><th style={thStyle}>LTV</th><td style={tdStyle}>{toPercent(results.ltv)}</td></tr>
                <tr><th style={thStyle}>Rental cover</th><td style={{
                  ...tdStyle,
                  color: results.rentalCoverValue < 1.25
                    ? 'red'
                    : results.rentalCoverValue < 1.45
                      ? '#ff9900'
                      : 'green'
                }}>{toPercent(results.rentalCoverValue)}</td></tr>
                <tr><th style={thStyle}>Rent (p/m)</th><td style={tdStyle}>{toCurrency(results.rent)}</td></tr>
                <tr><th style={thStyle}>Annual rent income</th><td style={tdStyle}>{toCurrency(results.annualRent)}</td></tr>
                <tr><th style={thStyle}>{results.mortgageType === 'interestOnly' ? 'Mortgage interest only (p/m)' : 'Mortgage repayment (p/m)'}</th><td style={tdStyle}>{toCurrency(results.mortgageInterest)}</td></tr>
                <tr><th style={thStyle}>Agency fee (p/m)</th><td style={tdStyle}>{toCurrency(results.agencyFee)}</td></tr>
                <tr><th style={thStyle}>Additional monthly fees</th><td style={tdStyle}>{toCurrency(results.additionalFees)}</td></tr>
                <tr><th style={thStyle}>Estimated value after 2 years</th><td style={tdStyle}>{toCurrency(results.valueAfter2Years)}</td></tr>
                <tr><th style={thStyle}>Estimated value after 5 years</th><td style={tdStyle}>{toCurrency(results.valueAfter5Years)}</td></tr>
                <tr><th style={thStyle}>Gross yield</th><td style={tdStyle}>{results.grossYield.toFixed(2)}%</td></tr>
                <tr><th style={thStyle}>Net yield</th><td style={tdStyle}>{results.netYield.toFixed(2)}%</td></tr>
                <tr><th style={thStyle}>ROI</th><td style={tdStyle}>{toPercent(results.roi)}</td></tr>
                <tr><th style={{ ...thStyle, color: 'red' }}>Expenses (per month, estimated)</th><td style={{ ...tdStyle, color: 'red' }}>{toCurrency(results.monthlyExpenses)}</td></tr>
                <tr><th style={{ ...thStyle, color: 'green' }}>Profit after all expenses (per month)</th><td style={{ ...tdStyle, color: 'green' }}>{toCurrency(results.monthlyNetProfit)}</td></tr>
                <tr><th style={thStyle}>5-Year ROI</th><td style={tdStyle}>{typeof results.roi5Year === 'number' ? results.roi5Year.toFixed(2) + '%' : ''}</td></tr>
                <tr><th style={thStyle}>5-Year Capital Gain</th><td style={tdStyle}>{typeof results.capitalGain === 'number' ? '£' + results.capitalGain.toLocaleString(undefined, { maximumFractionDigits: 2 }) : ''}</td></tr>
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
