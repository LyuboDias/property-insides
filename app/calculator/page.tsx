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
  const [mortgageRate, setMortgageRate] = useState("4.5");
  const [mortgageTerm, setMortgageTerm] = useState("25");
  const [mortgageType, setMortgageType] = useState("interestOnly"); // 'interestOnly' or 'repayment'
  const [maxLtv, setMaxLtv] = useState("75");
  const [rentalCover, setRentalCover] = useState("150");
  const [stressRate, setStressRate] = useState("8.0");
  // New fields
  const [depositOverride, setDepositOverride] = useState("");
  const [agencyFee, setAgencyFee] = useState("11"); // percent
  const [additionalFees, setAdditionalFees] = useState("");
  const [dateAdded, setDateAdded] = useState("");
  const [link, setLink] = useState("");
  const [numBeds, setNumBeds] = useState("");
  const [soldDate, setSoldDate] = useState("");
  const [soldPrice, setSoldPrice] = useState("");
  const [comment, setComment] = useState("");
  const [insurance, setInsurance] = useState("350");
  const [growth, setGrowth] = useState("7");
  const [tenure, setTenure] = useState("");
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [propertyLink, setPropertyLink] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");

  // Results state
  const [results, setResults] = useState<any | null>(null);

  // Handle property link scraping and form population
  const handlePropertyLinkScrape = async () => {
    if (!propertyLink.trim()) {
      setLinkError("Please enter a property link");
      return;
    }

    // Validate it's a RightMove link
    if (!propertyLink.includes('rightmove.co.uk/properties/')) {
      setLinkError("Please enter a valid RightMove property link");
      return;
    }

    setLinkLoading(true);
    setLinkError("");

    try {
      const response = await fetch("/api/scrape-rightmove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: propertyLink }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch property info");
      }

      const data = await response.json();
      const property = data.property;

      // Populate form fields with scraped data
      if (property.Address && property.Address !== 'Not found') {
        setAddress(property.Address);
      }

      if (property['Post Code'] && property['Post Code'] !== 'Not found') {
        setPostCode(property['Post Code']);
      }

      if (property.Bedrooms && property.Bedrooms !== 'Not found') {
        setNumBeds(property.Bedrooms);
      }

      if (property['Date Added'] && property['Date Added'] !== 'Not found') {
        // Convert DD/MM/YYYY to YYYY-MM-DD for date input
        const dateParts = property['Date Added'].split('/');
        if (dateParts.length === 3) {
          const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
          setDateAdded(formattedDate);
        }
      }

      if (property.Price && property.Price !== 'Not found') {
        // Extract numeric value from price string (e.g., "£140,000" -> "140000")
        const priceMatch = property.Price.match(/£?([0-9,]+)/);
        if (priceMatch) {
          const numericPrice = priceMatch[1].replace(/,/g, '');
          setPurchase(numericPrice);
        }
      }

      if (property.Tenure && property.Tenure !== 'Not found') {
        setTenure(property.Tenure);
      }

      console.log('Property Images from API:', property.Images);
      if (property.Images && Array.isArray(property.Images) && property.Images.length > 0) {
        console.log('Setting property images:', property.Images.length, 'images');
        setPropertyImages(property.Images);
      } else {
        console.log('No property images found or invalid format');
        setPropertyImages([]);
      }

      // Set the link field to the scraped URL
      setLink(propertyLink);

      console.log('Property data scraped and form populated:', property);
      
    } catch (err: any) {
      setLinkError(err.message || "Failed to scrape property data");
      console.error('Property scrape error:', err);
    } finally {
      setLinkLoading(false);
    }
  };

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
      tenure,
      propertyImages,
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
      ["Tenure", results.tenure],
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
        {/* Property Link Auto-Population Section */}
        <div style={{ width: '100%', maxWidth: 1200, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, marginBottom: 24, color: '#000' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#000' }}>Auto-Populate from RightMove Link</h3>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
            Paste a RightMove property link to automatically populate the form fields below.
          </p>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>
                Property Link
              </label>
              <input
                type="url"
                value={propertyLink}
                onChange={e => setPropertyLink(e.target.value)}
                placeholder="https://www.rightmove.co.uk/properties/123456789#/?channel=RES_BUY"
                style={{
                  ...inputStyle,
                  minHeight: 40
                }}
              />
            </div>
            <button
              type="button"
              onClick={handlePropertyLinkScrape}
              disabled={linkLoading || !propertyLink.trim()}
              style={{
                background: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: linkLoading || !propertyLink.trim() ? 'not-allowed' : 'pointer',
                opacity: linkLoading || !propertyLink.trim() ? 0.7 : 1,
                minHeight: 40,
                whiteSpace: 'nowrap'
              }}
            >
              {linkLoading ? "Scraping..." : "Auto-Fill Form"}
            </button>
          </div>
          
          {linkError && (
            <div style={{ color: 'red', marginTop: 8, fontSize: 14 }}>
              {linkError}
            </div>
          )}
        </div>

        <form onSubmit={handleCalculate} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 24, width: '100%', maxWidth: 1200, marginBottom: 32, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, color: '#000' }}>
          {/* Property Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Post Code</label>
            <input type="text" value={postCode} onChange={e => setPostCode(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Link <span style={{ color: 'red' }}>*</span></label>
            <input type="url" value={link} onChange={e => setLink(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Date added</label>
            <input type="date" value={dateAdded} onChange={e => setDateAdded(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>No of beds</label>
            <input type="number" value={numBeds} onChange={e => setNumBeds(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Tenure</label>
            <input type="text" value={tenure} onChange={e => setTenure(e.target.value)} style={inputStyle} placeholder="e.g. Freehold, Leasehold" />
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
          <div style={{ width: '100%', maxWidth: 1200, display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Warning Alert */}
            {Number(cash) < results.totalInvestment && (
              <div style={{ 
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)', 
                color: '#fff', 
                padding: 20, 
                borderRadius: 12, 
                boxShadow: '0 4px 12px rgba(255,107,107,0.3)',
                fontSize: 16,
                fontWeight: 500
              }}>
                ⚠️ Warning: Your available cash ({toCurrency(Number(cash))}) is less than the total investment required ({toCurrency(results.totalInvestment)}).
              </div>
            )}
            {/* Modern Cards Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

              {/* Property Details Card */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#1a202c', fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🏠 Property Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {results.dateAdded && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#4a5568', fontWeight: 500 }}>Date Added</span>
                        <span style={{ fontWeight: 600, color: '#1a202c' }}>{results.dateAdded}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#4a5568', fontWeight: 500 }}>Days Since Added</span>
                        <span style={{ fontWeight: 600, color: '#1a202c' }}>{Math.floor((Date.now() - new Date(results.dateAdded).getTime()) / (1000 * 60 * 60 * 24))}</span>
                      </div>
                    </>
                  )}
                  {results.numBeds && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#4a5568', fontWeight: 500 }}>Bedrooms</span>
                      <span style={{ fontWeight: 600, color: '#1a202c' }}>{results.numBeds}</span>
                    </div>
                  )}
                  {results.tenure && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#4a5568', fontWeight: 500 }}>Tenure</span>
                      <span style={{ fontWeight: 600, color: '#1a202c' }}>{results.tenure}</span>
                    </div>
                  )}
                  {results.link && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#4a5568', fontWeight: 500 }}>RightMove Link</span>
                      <a href={results.link} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 600 }}>
                        View Property →
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Investment Summary Card */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#1a202c', fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  💰 Investment Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#4a5568', fontWeight: 500 }}>Purchase Price</span>
                    <span style={{ fontWeight: 700, color: '#1a202c', fontSize: 16 }}>{toCurrency(Number(purchase))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#4a5568', fontWeight: 500 }}>Deposit</span>
                    <span style={{ fontWeight: 600, color: '#1a202c' }}>{toCurrency(results.deposit)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#4a5568', fontWeight: 500 }}>Stamp Duty</span>
                    <span style={{ fontWeight: 600, color: '#1a202c' }}>{toCurrency(results.stampDuty)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#4a5568', fontWeight: 500 }}>Bank Fees</span>
                    <span style={{ fontWeight: 600, color: '#1a202c' }}>{toCurrency(results.fees)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#4a5568', fontWeight: 500 }}>Repair Costs</span>
                    <span style={{ fontWeight: 600, color: '#1a202c' }}>{toCurrency(results.repair)}</span>
                  </div>
                  <hr style={{ margin: '16px 0', border: 'none', borderTop: '2px solid #e2e8f0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#1a202c', fontWeight: 700, fontSize: 16 }}>Total Investment</span>
                    <span style={{ fontWeight: 700, color: '#667eea', fontSize: 18 }}>{toCurrency(results.totalInvestment)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#4a5568', fontWeight: 500 }}>Mortgage Amount</span>
                    <span style={{ fontWeight: 600, color: '#1a202c' }}>{toCurrency(results.mortgage)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#4a5568', fontWeight: 500 }}>LTV</span>
                    <span style={{ fontWeight: 600, color: '#1a202c' }}>{toPercent(results.ltv)}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Cash Flow Card */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#1a202c', fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  📈 Monthly Cash Flow
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#22c55e', fontWeight: 600 }}>Monthly Rent</span>
                    <span style={{ fontWeight: 700, color: '#22c55e', fontSize: 16 }}>+{toCurrency(results.rent)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#4a5568', fontWeight: 500 }}>Annual Rent Income</span>
                    <span style={{ fontWeight: 600, color: '#22c55e' }}>{toCurrency(results.annualRent)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#ef4444', fontWeight: 500 }}>{results.mortgageType === 'interestOnly' ? 'Mortgage Interest (p/m)' : 'Mortgage Payment (p/m)'}</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>-{toCurrency(results.mortgageInterest)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#ef4444', fontWeight: 500 }}>Agency Fee (p/m)</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>-{toCurrency(results.agencyFee)}</span>
                  </div>
                  {results.insurance && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ef4444', fontWeight: 500 }}>Insurance</span>
                      <span style={{ fontWeight: 600, color: '#ef4444' }}>-{toCurrency(Number(results.insurance))}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#ef4444', fontWeight: 500 }}>Additional Monthly Fees</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>-{toCurrency(results.additionalFees)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#ef4444', fontWeight: 500 }}>Estimated Expenses (p/m)</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>-{toCurrency(results.monthlyExpenses)}</span>
                  </div>
                  <hr style={{ margin: '16px 0', border: 'none', borderTop: '2px solid #e2e8f0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#1a202c', fontWeight: 700, fontSize: 16 }}>Net Monthly Profit</span>
                    <span style={{ 
                      fontWeight: 700, 
                      color: results.monthlyNetProfit >= 0 ? '#22c55e' : '#ef4444', 
                      fontSize: 18 
                    }}>
                      {results.monthlyNetProfit >= 0 ? '+' : ''}{toCurrency(results.monthlyNetProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics Card */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#1a202c', fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  📊 Key Investment Metrics
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ color: '#4a5568', fontWeight: 500 }}>Gross Yield</span>
                      <span style={{ fontWeight: 700, color: '#667eea', fontSize: 16 }}>{results.grossYield.toFixed(2)}%</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 8, height: 6, overflow: 'hidden' }}>
                      <div style={{ 
                        background: results.grossYield >= 8 ? '#22c55e' : results.grossYield >= 6 ? '#f59e0b' : '#ef4444',
                        height: '100%', 
                        width: `${Math.min(results.grossYield * 2, 100)}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ color: '#4a5568', fontWeight: 500 }}>Net Yield</span>
                      <span style={{ fontWeight: 700, color: '#8b5cf6', fontSize: 16 }}>{results.netYield.toFixed(2)}%</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 8, height: 6, overflow: 'hidden' }}>
                      <div style={{ 
                        background: results.netYield >= 6 ? '#22c55e' : results.netYield >= 4 ? '#f59e0b' : '#ef4444',
                        height: '100%', 
                        width: `${Math.min(results.netYield * 3, 100)}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ color: '#4a5568', fontWeight: 500 }}>Rental Cover</span>
                      <span style={{ 
                        fontWeight: 700, 
                        color: results.rentalCoverValue >= 1.45 ? '#22c55e' : results.rentalCoverValue >= 1.25 ? '#f59e0b' : '#ef4444',
                        fontSize: 16 
                      }}>
                        {toPercent(results.rentalCoverValue)}
                      </span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 8, height: 6, overflow: 'hidden' }}>
                      <div style={{ 
                        background: results.rentalCoverValue >= 1.45 ? '#22c55e' : results.rentalCoverValue >= 1.25 ? '#f59e0b' : '#ef4444',
                        height: '100%', 
                        width: `${Math.min(results.rentalCoverValue * 60, 100)}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#4a5568', fontWeight: 500 }}>ROI</span>
                    <span style={{ fontWeight: 700, color: '#10b981', fontSize: 16 }}>{toPercent(results.roi)}</span>
                  </div>
                </div>
              </div>

              {/* Future Projections Card */}
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 16, padding: 24, boxShadow: '0 8px 32px rgba(102,126,234,0.3)', color: '#fff' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🚀 Future Projections
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, opacity: 0.9 }}>Current Value</span>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{toCurrency(Number(purchase))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, opacity: 0.9 }}>2-Year Value</span>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{toCurrency(results.valueAfter2Years)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, opacity: 0.9 }}>5-Year Value</span>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{toCurrency(results.valueAfter5Years)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, opacity: 0.9 }}>5-Year Capital Gain</span>
                    <span style={{ fontWeight: 700, fontSize: 18, color: '#fbbf24' }}>
                      {typeof results.capitalGain === 'number' ? '£' + results.capitalGain.toLocaleString(undefined, { maximumFractionDigits: 2 }) : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, opacity: 0.9 }}>5-Year ROI</span>
                    <span style={{ fontWeight: 700, fontSize: 18, color: '#34d399' }}>
                      {typeof results.roi5Year === 'number' ? results.roi5Year.toFixed(2) + '%' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Details Card */}
              {(results.soldDate || results.soldPrice || results.comment) && (
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <h3 style={{ color: '#1a202c', fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    📝 Additional Details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {results.soldDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#4a5568', fontWeight: 500 }}>Sold Date</span>
                        <span style={{ fontWeight: 600, color: '#1a202c' }}>{results.soldDate}</span>
                      </div>
                    )}
                    {results.soldPrice && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#4a5568', fontWeight: 500 }}>Sold Price</span>
                        <span style={{ fontWeight: 600, color: '#1a202c' }}>{toCurrency(Number(results.soldPrice))}</span>
                      </div>
                    )}
                    {results.comment && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ color: '#4a5568', fontWeight: 500 }}>Comments/Notes</span>
                        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, color: '#1a202c', fontSize: 14, lineHeight: 1.5 }}>
                          {results.comment}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
            
            {/* Download Button */}
            <div style={{ textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={handleDownload}
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 12, 
                  padding: '16px 32px', 
                  fontSize: 16, 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
                  transition: 'all 0.2s'
                }}
              >
                📥 Download Detailed Results
              </button>
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
