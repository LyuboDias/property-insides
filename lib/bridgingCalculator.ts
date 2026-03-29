/** Bridge-to-BTL deal analyzer — pure calculation functions */

export type RefurbType = "light" | "medium" | "heavy";

export interface BridgingCalculatorInputs {
  purchase_price: number;
  estimated_current_value?: number;
  below_market_value_percent?: number;
  refurb_type: RefurbType;
  repair_cost: number;
  contingency_percent: number;
  bridging_ltv_percent: number;
  monthly_interest_rate_percent: number;
  term_months: number;
  arrangement_fee_percent: number;
  exit_fee_percent: number;
  broker_fee: number;
  valuation_fee: number;
  legal_fees: number;
  stamp_duty: number;
  stamp_duty_auto: boolean;
  survey_costs: number;
  insurance: number;
  monthly_holding_costs: number;
  other_costs: number;
  end_value: number;
  btl_ltv_percent: number;
  btl_interest_rate_percent: number;
  monthly_rent: number;
  add_fees_to_loan: boolean;
}

/** SDLT for additional property / Ltd (England) — same bands as main calculator */
export function calculateStampDuty(purchasePrice: number): number {
  if (purchasePrice <= 40000) return 0;
  let remaining = purchasePrice;
  let sdlt = 0;
  if (remaining > 1500000) {
    sdlt += (remaining - 1500000) * 0.15;
    remaining = 1500000;
  }
  if (remaining > 925000) {
    sdlt += (remaining - 925000) * 0.13;
    remaining = 925000;
  }
  if (remaining > 250000) {
    sdlt += (remaining - 250000) * 0.08;
    remaining = 250000;
  }
  if (remaining > 0) {
    sdlt += remaining * 0.03;
  }
  return sdlt;
}

export function calculateRefurb(repairCost: number, contingencyPercent: number): number {
  return repairCost + (repairCost * contingencyPercent) / 100;
}

export function calculateBridgeLoan(purchasePrice: number, bridgingLtvPercent: number): {
  bridge_loan: number;
  cash_deposit: number;
} {
  const bridge_loan = (purchasePrice * bridgingLtvPercent) / 100;
  const cash_deposit = purchasePrice - bridge_loan;
  return { bridge_loan, cash_deposit };
}

export interface BridgingCostsParams {
  bridge_loan: number;
  monthly_interest_rate_percent: number;
  term_months: number;
  arrangement_fee_percent: number;
  exit_fee_percent: number;
  broker_fee: number;
  monthly_holding_costs: number;
  add_fees_to_loan: boolean;
}

export function calculateBridgingCosts(p: BridgingCostsParams): {
  arrangement_fee: number;
  exit_fee: number;
  loan_principal_for_interest: number;
  bridging_interest: number;
  holding_costs: number;
  /** Full economic bridging cost (interest + all fees + broker + holding) — for dashboard */
  total_bridging_cost: number;
  /** Portion of bridging costs actually paid from cash (excludes arr/exit if added to loan) */
  bridging_cost_cash: number;
} {
  const arrangement_fee = (p.bridge_loan * p.arrangement_fee_percent) / 100;
  const exit_fee = (p.bridge_loan * p.exit_fee_percent) / 100;
  const capitalized = p.add_fees_to_loan ? arrangement_fee + exit_fee : 0;
  const loan_principal_for_interest = p.bridge_loan + capitalized;
  const bridging_interest =
    (loan_principal_for_interest * p.monthly_interest_rate_percent) / 100 * p.term_months;
  const holding_costs = p.monthly_holding_costs * p.term_months;
  const feeCash =
    p.add_fees_to_loan ? 0 : arrangement_fee + exit_fee;
  const total_bridging_cost =
    bridging_interest + arrangement_fee + exit_fee + p.broker_fee + holding_costs;
  const bridging_cost_cash =
    bridging_interest + p.broker_fee + holding_costs + feeCash;
  return {
    arrangement_fee,
    exit_fee,
    loan_principal_for_interest,
    bridging_interest,
    holding_costs,
    total_bridging_cost,
    bridging_cost_cash,
  };
}

export interface RefinanceResult {
  btl_mortgage: number;
  money_released: number;
  cash_left_in_deal: number;
}

export function calculateRefinance(
  endValue: number,
  btlLtvPercent: number,
  bridgeLoan: number,
  totalCashInvested: number
): RefinanceResult {
  const btl_mortgage = (endValue * btlLtvPercent) / 100;
  const money_released = btl_mortgage - bridgeLoan;
  const cash_left_in_deal = totalCashInvested - money_released;
  return { btl_mortgage, money_released, cash_left_in_deal };
}

export interface ROIResult {
  equity_created: number;
  roi_percent: number;
}

export function calculateROI(params: {
  end_value: number;
  total_project_cost: number;
  total_cash_invested: number;
}): ROIResult {
  const { end_value, total_project_cost, total_cash_invested } = params;
  const equity_created = end_value - total_project_cost;
  const roi_percent =
    total_cash_invested > 0 ? (equity_created / total_cash_invested) * 100 : 0;
  return { equity_created, roi_percent };
}

export interface RentalMetrics {
  annual_rent: number;
  annual_mortgage_interest: number;
  icr: number;
}

export function calculateRentalMetrics(
  monthlyRent: number,
  btlMortgage: number,
  btlInterestRatePercent: number
): RentalMetrics {
  const annual_rent = monthlyRent * 12;
  const annual_mortgage_interest = (btlMortgage * btlInterestRatePercent) / 100;
  const icr =
    annual_mortgage_interest > 0 ? annual_rent / annual_mortgage_interest : 0;
  return { annual_rent, annual_mortgage_interest, icr };
}

export interface FullDealResult {
  stamp_duty_used: number;
  total_refurb: number;
  total_purchase_cost: number;
  total_project_cost: number;
  bridge_loan: number;
  cash_deposit: number;
  arrangement_fee: number;
  exit_fee: number;
  loan_principal_for_interest: number;
  bridging_interest: number;
  holding_costs: number;
  total_bridging_cost: number;
  bridging_cost_cash: number;
  total_cash_invested: number;
  btl_mortgage: number;
  money_released: number;
  cash_left_in_deal: number;
  equity_created: number;
  roi_percent: number;
  annual_rent: number;
  annual_mortgage_interest: number;
  icr: number;
  deal_rating: string;
  all_money_out: boolean;
}

export function runBridgingCalculator(inputs: BridgingCalculatorInputs): FullDealResult {
  const stamp_duty_used = inputs.stamp_duty_auto
    ? calculateStampDuty(inputs.purchase_price)
    : inputs.stamp_duty;

  const total_refurb = calculateRefurb(inputs.repair_cost, inputs.contingency_percent);

  const total_purchase_cost =
    inputs.purchase_price +
    stamp_duty_used +
    inputs.legal_fees +
    inputs.survey_costs;

  const total_project_cost =
    total_purchase_cost + total_refurb + inputs.other_costs;

  const { bridge_loan, cash_deposit } = calculateBridgeLoan(
    inputs.purchase_price,
    inputs.bridging_ltv_percent
  );

  const bridging = calculateBridgingCosts({
    bridge_loan,
    monthly_interest_rate_percent: inputs.monthly_interest_rate_percent,
    term_months: inputs.term_months,
    arrangement_fee_percent: inputs.arrangement_fee_percent,
    exit_fee_percent: inputs.exit_fee_percent,
    broker_fee: inputs.broker_fee,
    monthly_holding_costs: inputs.monthly_holding_costs,
    add_fees_to_loan: inputs.add_fees_to_loan,
  });

  const total_cash_invested =
    cash_deposit +
    total_refurb +
    stamp_duty_used +
    inputs.survey_costs +
    inputs.insurance +
    inputs.other_costs +
    bridging.bridging_cost_cash +
    inputs.valuation_fee +
    inputs.legal_fees;

  const refinance = calculateRefinance(
    inputs.end_value,
    inputs.btl_ltv_percent,
    bridge_loan,
    total_cash_invested
  );

  const { equity_created, roi_percent } = calculateROI({
    end_value: inputs.end_value,
    total_project_cost,
    total_cash_invested,
  });

  const rental = calculateRentalMetrics(
    inputs.monthly_rent,
    refinance.btl_mortgage,
    inputs.btl_interest_rate_percent
  );

  const all_money_out = refinance.cash_left_in_deal <= 0;
  const deal_rating = getDealRating(refinance.cash_left_in_deal, roi_percent);

  return {
    stamp_duty_used,
    total_refurb,
    total_purchase_cost,
    total_project_cost,
    bridge_loan,
    cash_deposit,
    arrangement_fee: bridging.arrangement_fee,
    exit_fee: bridging.exit_fee,
    loan_principal_for_interest: bridging.loan_principal_for_interest,
    bridging_interest: bridging.bridging_interest,
    holding_costs: bridging.holding_costs,
    total_bridging_cost: bridging.total_bridging_cost,
    bridging_cost_cash: bridging.bridging_cost_cash,
    total_cash_invested,
    btl_mortgage: refinance.btl_mortgage,
    money_released: refinance.money_released,
    cash_left_in_deal: refinance.cash_left_in_deal,
    equity_created,
    roi_percent,
    annual_rent: rental.annual_rent,
    annual_mortgage_interest: rental.annual_mortgage_interest,
    icr: rental.icr,
    deal_rating,
    all_money_out,
  };
}

export function getDealRating(cashLeftInDeal: number, roiPercent: number): string {
  if (cashLeftInDeal <= 0) return "Excellent (BRRR Ideal)";
  if (roiPercent > 25) return "Great Deal";
  if (roiPercent >= 15) return "Good Deal";
  return "Marginal Deal";
}

/** Sensitivity: scale end value or repair and return key outputs */
export function sensitivityEndValue(
  inputs: BridgingCalculatorInputs,
  endValueMultiplier: number
): Pick<FullDealResult, "equity_created" | "roi_percent" | "cash_left_in_deal" | "money_released"> {
  const scaled = { ...inputs, end_value: inputs.end_value * endValueMultiplier };
  const r = runBridgingCalculator(scaled);
  return {
    equity_created: r.equity_created,
    roi_percent: r.roi_percent,
    cash_left_in_deal: r.cash_left_in_deal,
    money_released: r.money_released,
  };
}

export function sensitivityRepair(
  inputs: BridgingCalculatorInputs,
  repairMultiplier: number
): Pick<FullDealResult, "total_refurb" | "total_cash_invested" | "roi_percent" | "cash_left_in_deal"> {
  const scaled = {
    ...inputs,
    repair_cost: inputs.repair_cost * repairMultiplier,
  };
  const r = runBridgingCalculator(scaled);
  return {
    total_refurb: r.total_refurb,
    total_cash_invested: r.total_cash_invested,
    roi_percent: r.roi_percent,
    cash_left_in_deal: r.cash_left_in_deal,
  };
}
