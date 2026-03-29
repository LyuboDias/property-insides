"use client";

import { useMemo, useState } from "react";
import NavigationBar from "@/components/NavigationBar";
import {
  runBridgingCalculator,
  sensitivityEndValue,
  sensitivityRepair,
  type BridgingCalculatorInputs,
} from "@/lib/bridgingCalculator";

const toCurrency = (n: number | undefined | null) =>
  typeof n === "number" && !isNaN(n)
    ? `£${n.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`
    : "£0";

const toPercentDisplay = (n: number, decimals = 1) =>
  n % 1 === 0 ? `${n.toFixed(0)}%` : `${n.toFixed(decimals)}%`;

const inputStyle: React.CSSProperties = {
  background: "#f4f6fa",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  padding: "8px 10px",
  fontSize: 15,
  color: "#222",
  outline: "none",
  fontWeight: 400,
  marginTop: 2,
  marginBottom: 2,
  width: "100%",
  boxSizing: "border-box",
};

function FieldTip({ text }: { text: string }) {
  return (
    <span
      className="bc-tip"
      title={text}
      style={{
        fontSize: 12,
        color: "#667eea",
        fontWeight: 600,
        backgroundColor: "rgba(102,126,234,0.1)",
        borderRadius: "50%",
        width: 18,
        height: 18,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(102,126,234,0.2)",
        cursor: "help",
        flexShrink: 0,
      }}
    >
      ℹ
    </span>
  );
}

function Label({
  children,
  tip,
}: {
  children: React.ReactNode;
  tip?: string;
}) {
  return (
    <label
      style={{
        fontWeight: 500,
        marginBottom: 2,
        fontSize: 13,
        color: "#000",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {children}
      {tip ? <FieldTip text={tip} /> : null}
    </label>
  );
}

const gridForm: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
};

export default function BridgingCalculatorPage() {
  const [purchase_price, setPurchasePrice] = useState("200000");
  const [estimated_current_value, setEstimatedCurrentValue] = useState("");
  const [below_market_value_percent, setBmvPercent] = useState("");
  const [refurb_type, setRefurbType] = useState<"light" | "medium" | "heavy">(
    "medium"
  );
  const [repair_cost, setRepairCost] = useState("15000");
  const [contingency_percent, setContingencyPercent] = useState("12");
  const [bridging_ltv_percent, setBridgingLtv] = useState("70");
  const [monthly_interest_rate_percent, setBridgeMonthlyRate] =
    useState("0.85");
  const [term_months, setTermMonths] = useState("12");
  const [arrangement_fee_percent, setArrangementPct] = useState("2");
  const [exit_fee_percent, setExitPct] = useState("1");
  const [broker_fee, setBrokerFee] = useState("1500");
  const [valuation_fee, setValuationFee] = useState("500");
  const [legal_fees, setLegalFees] = useState("1500");
  const [stamp_duty_manual, setStampDutyManual] = useState("0");
  const [stamp_duty_auto, setStampDutyAuto] = useState(true);
  const [survey_costs, setSurveyCosts] = useState("400");
  const [insurance, setInsurance] = useState("300");
  const [monthly_holding_costs, setMonthlyHolding] = useState("200");
  const [other_costs, setOtherCosts] = useState("500");
  const [end_value, setEndValue] = useState("280000");
  const [btl_ltv_percent, setBtlLtv] = useState("75");
  const [btl_interest_rate_percent, setBtlRate] = useState("5.5");
  const [monthly_rent, setMonthlyRent] = useState("1400");
  const [add_fees_to_loan, setAddFeesToLoan] = useState(false);

  const inputs: BridgingCalculatorInputs = useMemo(() => {
    const n = (s: string) => Number(s) || 0;
    return {
      purchase_price: n(purchase_price),
      estimated_current_value: estimated_current_value
        ? n(estimated_current_value)
        : undefined,
      below_market_value_percent: below_market_value_percent
        ? n(below_market_value_percent)
        : undefined,
      refurb_type,
      repair_cost: n(repair_cost),
      contingency_percent: n(contingency_percent),
      bridging_ltv_percent: n(bridging_ltv_percent),
      monthly_interest_rate_percent: n(monthly_interest_rate_percent),
      term_months: n(term_months),
      arrangement_fee_percent: n(arrangement_fee_percent),
      exit_fee_percent: n(exit_fee_percent),
      broker_fee: n(broker_fee),
      valuation_fee: n(valuation_fee),
      legal_fees: n(legal_fees),
      stamp_duty: n(stamp_duty_manual),
      stamp_duty_auto,
      survey_costs: n(survey_costs),
      insurance: n(insurance),
      monthly_holding_costs: n(monthly_holding_costs),
      other_costs: n(other_costs),
      end_value: n(end_value),
      btl_ltv_percent: n(btl_ltv_percent),
      btl_interest_rate_percent: n(btl_interest_rate_percent),
      monthly_rent: n(monthly_rent),
      add_fees_to_loan,
    };
  }, [
    purchase_price,
    estimated_current_value,
    below_market_value_percent,
    refurb_type,
    repair_cost,
    contingency_percent,
    bridging_ltv_percent,
    monthly_interest_rate_percent,
    term_months,
    arrangement_fee_percent,
    exit_fee_percent,
    broker_fee,
    valuation_fee,
    legal_fees,
    stamp_duty_manual,
    stamp_duty_auto,
    survey_costs,
    insurance,
    monthly_holding_costs,
    other_costs,
    end_value,
    btl_ltv_percent,
    btl_interest_rate_percent,
    monthly_rent,
    add_fees_to_loan,
  ]);

  const result = useMemo(() => runBridgingCalculator(inputs), [inputs]);

  const sensEndUp = useMemo(
    () => sensitivityEndValue(inputs, 1.1),
    [inputs]
  );
  const sensEndDown = useMemo(
    () => sensitivityEndValue(inputs, 0.9),
    [inputs]
  );
  const sensRepairUp = useMemo(
    () => sensitivityRepair(inputs, 1.1),
    [inputs]
  );
  const sensRepairDown = useMemo(
    () => sensitivityRepair(inputs, 0.9),
    [inputs]
  );

  const highlightCard: React.CSSProperties = {
    background:
      "linear-gradient(135deg, rgba(102,126,234,0.12) 0%, rgba(118,75,162,0.15) 100%)",
    border: "2px solid rgba(102,126,234,0.35)",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 8px 28px rgba(102,126,234,0.2)",
  };

  return (
    <>
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-area {
            box-shadow: none !important;
          }
        }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          display: "flex",
          color: "#000",
        }}
      >
        <NavigationBar
          currentPage="Bridging Calculator"
          pageIcon="🌉"
        />

        <div
          className="main-content"
          style={{
            flex: 1,
            padding: "40px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#000",
            maxWidth: "100%",
          }}
        >
          <div
            className="print-area"
            style={{
              width: "100%",
              maxWidth: 1200,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div
              className="no-print"
              style={{
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  margin: 0,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Bridge-to-BTL Deal Analyzer
              </h1>
              <p style={{ color: "#64748b", fontSize: 15, marginTop: 8 }}>
                How much cash? Bridging cost? Refinance? Cash back or left in?
              </p>
            </div>

            {/* Key answers strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
              <div style={highlightCard}>
                <div style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>
                  How much cash do I need?
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#1e293b",
                    marginTop: 6,
                  }}
                >
                  {toCurrency(result.total_cash_invested)}
                </div>
              </div>
              <div style={highlightCard}>
                <div style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>
                  Total bridging cost
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#1e293b",
                    marginTop: 6,
                  }}
                >
                  {toCurrency(result.total_bridging_cost)}
                </div>
              </div>
              <div style={highlightCard}>
                <div style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>
                  After refurb value (input)
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#1e293b",
                    marginTop: 6,
                  }}
                >
                  {toCurrency(inputs.end_value)}
                </div>
              </div>
              <div style={highlightCard}>
                <div style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>
                  Refinance (BTL mortgage)
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#1e293b",
                    marginTop: 6,
                  }}
                >
                  {toCurrency(result.btl_mortgage)}
                </div>
              </div>
              <div
                style={{
                  ...highlightCard,
                  borderColor: result.all_money_out
                    ? "rgba(34,197,94,0.5)"
                    : "rgba(102,126,234,0.35)",
                  background: result.all_money_out
                    ? "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.12) 100%)"
                    : highlightCard.background,
                }}
              >
                <div style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>
                  Money released / left in
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: result.all_money_out ? "#15803d" : "#1e293b",
                    marginTop: 6,
                  }}
                >
                  {toCurrency(result.money_released)} /{" "}
                  {toCurrency(result.cash_left_in_deal)}
                </div>
                {result.all_money_out && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#15803d",
                    }}
                  >
                    All money out — BRRR ideal
                  </div>
                )}
              </div>
            </div>

            <form
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                padding: 32,
                border: "1px solid rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: 28,
              }}
              onSubmit={(e) => e.preventDefault()}
            >
              <div
                className="no-print"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  alignItems: "center",
                  paddingBottom: 8,
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={add_fees_to_loan}
                    onChange={(e) => setAddFeesToLoan(e.target.checked)}
                  />
                  Add arrangement &amp; exit fees to loan (interest on higher
                  principal; arr/exit not from cash)
                </label>
              </div>

              <section>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1a202c",
                    marginBottom: 16,
                    paddingBottom: 8,
                    borderBottom: "2px solid #f1f5f9",
                  }}
                >
                  A. Property purchase
                </h3>
                <div style={gridForm}>
                  <div>
                    <Label tip="Agreed purchase price for the property.">
                      Purchase price (£)
                    </Label>
                    <input
                      type="number"
                      value={purchase_price}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      style={inputStyle}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label tip="Optional. For your notes — not used in core calculations.">
                      Est. current value (£)
                    </Label>
                    <input
                      type="number"
                      value={estimated_current_value}
                      onChange={(e) => setEstimatedCurrentValue(e.target.value)}
                      style={inputStyle}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label tip="Optional discount vs market — informational only.">
                      Below market value (%)
                    </Label>
                    <input
                      type="number"
                      value={below_market_value_percent}
                      onChange={(e) => setBmvPercent(e.target.value)}
                      style={inputStyle}
                      min={0}
                      step={0.1}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1a202c",
                    marginBottom: 16,
                    paddingBottom: 8,
                    borderBottom: "2px solid #f1f5f9",
                  }}
                >
                  B. Refurbishment
                </h3>
                <div style={gridForm}>
                  <div>
                    <Label tip="Typical scope for budgeting contingency.">
                      Refurb type
                    </Label>
                    <select
                      value={refurb_type}
                      onChange={(e) =>
                        setRefurbType(e.target.value as typeof refurb_type)
                      }
                      style={inputStyle}
                    >
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>
                  <div>
                    <Label tip="Expected build / repair cost before contingency.">
                      Repair cost (£)
                    </Label>
                    <input
                      type="number"
                      value={repair_cost}
                      onChange={(e) => setRepairCost(e.target.value)}
                      style={inputStyle}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label tip="Buffer on repairs — often 10–15%.">
                      Contingency (%)
                    </Label>
                    <input
                      type="number"
                      value={contingency_percent}
                      onChange={(e) => setContingencyPercent(e.target.value)}
                      style={inputStyle}
                      min={0}
                      step={0.5}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1a202c",
                    marginBottom: 16,
                    paddingBottom: 8,
                    borderBottom: "2px solid #f1f5f9",
                  }}
                >
                  C. Bridging loan
                </h3>
                <div style={gridForm}>
                  <div>
                    <Label tip="Loan as % of purchase price.">
                      Bridging LTV (%)
                    </Label>
                    <input
                      type="number"
                      value={bridging_ltv_percent}
                      onChange={(e) => setBridgingLtv(e.target.value)}
                      style={inputStyle}
                      min={0}
                      max={100}
                      step={0.5}
                    />
                  </div>
                  <div>
                    <Label tip="Monthly rate on the bridging facility.">
                      Monthly interest rate (%)
                    </Label>
                    <input
                      type="number"
                      value={monthly_interest_rate_percent}
                      onChange={(e) => setBridgeMonthlyRate(e.target.value)}
                      style={inputStyle}
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div>
                    <Label tip="Bridging term before refinance or sale.">
                      Term (months)
                    </Label>
                    <input
                      type="number"
                      value={term_months}
                      onChange={(e) => setTermMonths(e.target.value)}
                      style={inputStyle}
                      min={1}
                    />
                  </div>
                  <div>
                    <Label tip="Usually % of gross loan.">
                      Arrangement fee (%)
                    </Label>
                    <input
                      type="number"
                      value={arrangement_fee_percent}
                      onChange={(e) => setArrangementPct(e.target.value)}
                      style={inputStyle}
                      min={0}
                      step={0.05}
                    />
                  </div>
                  <div>
                    <Label tip="Exit fee on gross loan.">
                      Exit fee (%)
                    </Label>
                    <input
                      type="number"
                      value={exit_fee_percent}
                      onChange={(e) => setExitPct(e.target.value)}
                      style={inputStyle}
                      min={0}
                      step={0.05}
                    />
                  </div>
                  <div>
                    <Label tip="Broker fee (cash).">
                      Broker fee (£)
                    </Label>
                    <input
                      type="number"
                      value={broker_fee}
                      onChange={(e) => setBrokerFee(e.target.value)}
                      style={inputStyle}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label tip="Lender / survey valuation fee.">
                      Valuation fee (£)
                    </Label>
                    <input
                      type="number"
                      value={valuation_fee}
                      onChange={(e) => setValuationFee(e.target.value)}
                      style={inputStyle}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label tip="Purchase legals for bridge / acquisition.">
                      Legal fees (£)
                    </Label>
                    <input
                      type="number"
                      value={legal_fees}
                      onChange={(e) => setLegalFees(e.target.value)}
                      style={inputStyle}
                      min={0}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1a202c",
                    marginBottom: 16,
                    paddingBottom: 8,
                    borderBottom: "2px solid #f1f5f9",
                  }}
                >
                  D. Additional costs
                </h3>
                <div style={gridForm}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={stamp_duty_auto}
                        onChange={(e) => setStampDutyAuto(e.target.checked)}
                      />
                      <span>
                        Auto-calculate SDLT (additional property / Ltd bands,
                        England)
                      </span>
                    </label>
                  </div>
                  {!stamp_duty_auto && (
                    <div>
                      <Label tip="Manual stamp duty entry.">
                        Stamp duty (£)
                      </Label>
                      <input
                        type="number"
                        value={stamp_duty_manual}
                        onChange={(e) => setStampDutyManual(e.target.value)}
                        style={inputStyle}
                        min={0}
                      />
                    </div>
                  )}
                  <div>
                    <Label tip="Surveyor / structural report.">
                      Survey costs (£)
                    </Label>
                    <input
                      type="number"
                      value={survey_costs}
                      onChange={(e) => setSurveyCosts(e.target.value)}
                      style={inputStyle}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label tip="Bridge period insurance (one-off or total).">
                      Insurance (£)
                    </Label>
                    <input
                      type="number"
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                      style={inputStyle}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label tip="Utilities, council tax, security — per month during bridge.">
                      Monthly holding costs (£)
                    </Label>
                    <input
                      type="number"
                      value={monthly_holding_costs}
                      onChange={(e) => setMonthlyHolding(e.target.value)}
                      style={inputStyle}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label tip="Miscellaneous project costs.">
                      Other costs (£)
                    </Label>
                    <input
                      type="number"
                      value={other_costs}
                      onChange={(e) => setOtherCosts(e.target.value)}
                      style={inputStyle}
                      min={0}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1a202c",
                    marginBottom: 16,
                    paddingBottom: 8,
                    borderBottom: "2px solid #f1f5f9",
                  }}
                >
                  E. Refinance (BTL)
                </h3>
                <div style={gridForm}>
                  <div>
                    <Label tip="GDV / expected value after refurb for refinance.">
                      End value (£)
                    </Label>
                    <input
                      type="number"
                      value={end_value}
                      onChange={(e) => setEndValue(e.target.value)}
                      style={inputStyle}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label tip="Typical BTL LTV after val — often ~75%.">
                      BTL LTV (%)
                    </Label>
                    <input
                      type="number"
                      value={btl_ltv_percent}
                      onChange={(e) => setBtlLtv(e.target.value)}
                      style={inputStyle}
                      min={0}
                      max={100}
                      step={0.5}
                    />
                  </div>
                  <div>
                    <Label tip="Annual interest rate on BTL mortgage (interest-only ICR).">
                      BTL interest rate (% p.a.)
                    </Label>
                    <input
                      type="number"
                      value={btl_interest_rate_percent}
                      onChange={(e) => setBtlRate(e.target.value)}
                      style={inputStyle}
                      min={0}
                      step={0.05}
                    />
                  </div>
                  <div>
                    <Label tip="Expected monthly rent after refinance.">
                      Monthly rent (£)
                    </Label>
                    <input
                      type="number"
                      value={monthly_rent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      style={inputStyle}
                      min={0}
                    />
                  </div>
                </div>
              </section>
            </form>

            {/* Results */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <div
                style={{
                  ...highlightCard,
                  textAlign: "center",
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    color: "#64748b",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Deal rating
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#334155",
                  }}
                >
                  {result.deal_rating}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 24,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      ROI
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#7c3aed",
                      }}
                    >
                      {toPercentDisplay(result.roi_percent)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      Cash left in deal
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#0d9488",
                      }}
                    >
                      {toCurrency(result.cash_left_in_deal)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      Money released
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#2563eb",
                      }}
                    >
                      {toCurrency(result.money_released)}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 20,
                }}
              >
                <ResultCard title="Deal summary">
                  <Row label="Total project cost" value={toCurrency(result.total_project_cost)} />
                  <Row label="Total cash invested" value={toCurrency(result.total_cash_invested)} strong />
                  <Row label="Bridging loan amount" value={toCurrency(result.bridge_loan)} />
                  <Row label="Cash deposit" value={toCurrency(result.cash_deposit)} />
                  <Row label="Total bridging cost" value={toCurrency(result.total_bridging_cost)} />
                </ResultCard>

                <ResultCard title="Bridging detail">
                  <Row label="Interest (term)" value={toCurrency(result.bridging_interest)} />
                  <Row label="Arrangement fee" value={toCurrency(result.arrangement_fee)} />
                  <Row label="Exit fee" value={toCurrency(result.exit_fee)} />
                  <Row label="Holding costs (term)" value={toCurrency(result.holding_costs)} />
                  <Row label="Loan principal for interest" value={toCurrency(result.loan_principal_for_interest)} />
                </ResultCard>

                <ResultCard title="Refinance outcome">
                  <Row label="End value" value={toCurrency(inputs.end_value)} />
                  <Row label="BTL mortgage" value={toCurrency(result.btl_mortgage)} strong />
                  <Row label="Money released" value={toCurrency(result.money_released)} strong />
                  <Row label="Cash left in deal" value={toCurrency(result.cash_left_in_deal)} strong />
                </ResultCard>

                <ResultCard title="Profitability">
                  <Row label="Equity created" value={toCurrency(result.equity_created)} />
                  <Row label="ROI" value={toPercentDisplay(result.roi_percent)} strong />
                </ResultCard>

                <ResultCard title="Rental metrics">
                  <Row label="Monthly rent" value={toCurrency(inputs.monthly_rent)} />
                  <Row label="Annual rent" value={toCurrency(result.annual_rent)} />
                  <Row label="Annual mortgage interest" value={toCurrency(result.annual_mortgage_interest)} />
                  <Row label="ICR" value={result.icr ? result.icr.toFixed(2) : "—"} strong />
                </ResultCard>
              </div>

              <section
                className="no-print"
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 16,
                    color: "#1a202c",
                  }}
                >
                  Sensitivity (±10%)
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 16,
                    fontSize: 14,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      End value
                    </div>
                    <SensRow
                      label="−10%"
                      roi={sensEndDown.roi_percent}
                      cash={sensEndDown.cash_left_in_deal}
                    />
                    <SensRow
                      label="+10%"
                      roi={sensEndUp.roi_percent}
                      cash={sensEndUp.cash_left_in_deal}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      Repair cost
                    </div>
                    <SensRow
                      label="−10%"
                      roi={sensRepairDown.roi_percent}
                      cash={sensRepairDown.cash_left_in_deal}
                    />
                    <SensRow
                      label="+10%"
                      roi={sensRepairUp.roi_percent}
                      cash={sensRepairUp.cash_left_in_deal}
                    />
                  </div>
                </div>
              </section>

              <div className="no-print" style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "14px 28px",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(102,126,234,0.3)",
                  }}
                >
                  Print / Save as PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "6px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span style={{ color: "#64748b", fontWeight: 500 }}>{label}</span>
      <span
        style={{
          fontWeight: strong ? 700 : 600,
          color: "#0f172a",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SensRow({
  label,
  roi,
  cash,
}: {
  label: string;
  roi: number;
  cash: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span>{label}</span>
      <span style={{ fontWeight: 600 }}>
        ROI {toPercentDisplay(roi)} · Cash in{" "}
        {toCurrency(cash)}
      </span>
    </div>
  );
}

function ResultCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 22,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <h3
        style={{
          color: "#1a202c",
          fontSize: 17,
          fontWeight: 700,
          margin: "0 0 12px 0",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
