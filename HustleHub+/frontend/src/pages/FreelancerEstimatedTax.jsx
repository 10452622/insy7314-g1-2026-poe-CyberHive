import React, { useEffect, useMemo, useState } from "react";
import { Calculator, TrendingUp, Wallet, Receipt, ShieldCheck } from "lucide-react";
import { fetchFreelancerOrders } from "../services/api";
import FreelancerHeader from "../components/FreelancerHeader";
import "../styles/FreelancerEstimatedTax.css";

// SARS 2026/2027 tax year: 1 March 2026 - 28 February 2027.
// Source: SARS, Rates of Tax for Individuals (2027 tax year).
// https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/

const TAX_YEAR = "2026/2027";
const TAX_YEAR_START = new Date(2026, 2, 1);
const NEXT_TAX_YEAR_START = new Date(2027, 2, 1);

// Official SARS progressive tax brackets for individuals.
const TAX_BRACKETS = [
  { limit: 245100, base: 0, rate: 0.18, label: "18%" },
  { limit: 383100, base: 44118, rate: 0.26, label: "26%" },
  { limit: 530200, base: 79998, rate: 0.31, label: "31%" },
  { limit: 695800, base: 125599, rate: 0.36, label: "36%" },
  { limit: 887000, base: 185215, rate: 0.39, label: "39%" },
  { limit: 1878600, base: 259783, rate: 0.41, label: "41%" },
  { limit: Infinity, base: 666339, rate: 0.45, label: "45%" }
];

// Official SARS rebates for the 2027 year of assessment.
const TAX_REBATES = {
  primary: 17820,
  secondary: 9765,
  tertiary: 3249
};

const money = (amount) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);

// Convert user input into a safe, non-negative number.
const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};

// Use the recorded completion date.
// Older records without completedAt use updatedAt as a temporary fallback.
const getCompletionDate = (booking) => {
  const date = booking.completedAt || booking.updatedAt;

  if (!date) return null;

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// Calculate annual tax using the SARS progressive tax brackets.
// Each bracket applies only to the portion of income in that bracket.
const calculateProgressiveTax = (taxableIncome) => {
  const income = safeNumber(taxableIncome);

  const bracket = TAX_BRACKETS.find(
    (item) => income <= item.limit
  ) || TAX_BRACKETS[TAX_BRACKETS.length - 1];

  const previousLimit =
    TAX_BRACKETS[TAX_BRACKETS.indexOf(bracket) - 1]?.limit || 0;

  const tax =
    bracket.base + (income - previousLimit) * bracket.rate;

  return {
    taxBeforeRebate: Math.max(0, tax),
    marginalRate: bracket.label
  };
};

// Determine the total SARS rebate according to the user's age category.
const calculateRebate = (ageCategory) => {
  let rebate = TAX_REBATES.primary;

  if (ageCategory === "65-74") {
    rebate += TAX_REBATES.secondary;
  }

  if (ageCategory === "75+") {
    rebate += TAX_REBATES.secondary + TAX_REBATES.tertiary;
  }

  return rebate;
};

function FreelancerEstimatedTax() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // These values are estimates entered by the user.
  // They remain in React state and are not persisted in browser storage.
  const [futureIncome, setFutureIncome] = useState("0");
  const [otherIncome, setOtherIncome] = useState("0");
  const [businessExpenses, setBusinessExpenses] = useState("0");
  const [taxAlreadyPaid, setTaxAlreadyPaid] = useState("0");
  const [ageCategory, setAgeCategory] = useState("under65");

  // Retrieve only the authenticated freelancer's bookings.
  useEffect(() => {
    let active = true;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetchFreelancerOrders();

        if (!active) return;

        const result = Array.isArray(response)
          ? response
          : response?.bookings || response?.orders || response?.data;

        if (!Array.isArray(result)) {
          throw new Error("Unexpected booking response format.");
        }

        setBookings(result);
      } catch (error) {
        if (!active) return;

        setBookings([]);
        setLoadError(
          error?.message || "Unable to retrieve your financial records."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBookings();

    return () => {
      active = false;
    };
  }, []);

  // Include completed bookings within the 2026/2027 SARS tax year.
  const completedBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (
        String(booking.status || "").toLowerCase() !== "completed"
      ) {
        return false;
      }

      const date = getCompletionDate(booking);

      return (
        date &&
        date >= TAX_YEAR_START &&
        date < NEXT_TAX_YEAR_START
      );
    });
  }, [bookings]);

  // Calculate recorded completed booking revenue.
  // This is not confirmed cash received because HustleHub+ does not
  // currently have payment-status or payment-confirmation records.
  const completedRevenue = useMemo(() => {
    return completedBookings.reduce((total, booking) => {
      return total + safeNumber(booking.amount);
    }, 0);
  }, [completedBookings]);

  // Read and validate all user-entered financial estimates.
  const projectedFutureIncome = safeNumber(futureIncome);
  const additionalIncome = safeNumber(otherIncome);
  const expenses = safeNumber(businessExpenses);
  const paidTax = safeNumber(taxAlreadyPaid);

  // Projected freelance revenue = completed revenue + expected future revenue.
  const projectedFreelanceIncome =
    completedRevenue + projectedFutureIncome;

  // Taxable business profit cannot be negative in this simplified calculator.
  const freelanceProfit = Math.max(
    0,
    projectedFreelanceIncome - expenses
  );

  // Add other taxable income, such as employment income.
  // This is important because SARS taxes an individual's combined taxable income.
  const taxableIncome = freelanceProfit + additionalIncome;

  // Apply the official progressive SARS tax calculation.
  const taxCalculation = calculateProgressiveTax(taxableIncome);

  const rebate = calculateRebate(ageCategory);

  // Tax cannot be negative after applying rebates.
  const taxAfterRebate = Math.max(
    0,
    taxCalculation.taxBeforeRebate - rebate
  );

  // Subtract PAYE and provisional tax already paid.
  const remainingTax = Math.max(
    0,
    taxAfterRebate - paidTax
  );

  // If payments exceed the estimate, display the potential credit separately.
  const potentialCredit = Math.max(
    0,
    paidTax - taxAfterRebate
  );

  // Estimated amount remaining after expenses and total annual tax liability.
  const estimatedNetIncome = Math.max(
    0,
    projectedFreelanceIncome +
      additionalIncome -
      expenses -
      taxAfterRebate
  );

  const effectiveTaxRate =
    taxableIncome > 0
      ? (taxAfterRebate / taxableIncome) * 100
      : 0;

  // Build a monthly completed-revenue chart for the current tax year.
  const monthlyIncome = useMemo(() => {
    const months = [];

    for (let month = 0; month < 12; month++) {
      const date = new Date(2026, 2 + month, 1);

      months.push({
        label: date.toLocaleDateString("en-ZA", {
          month: "short"
        }),
        value: 0
      });
    }

    completedBookings.forEach((booking) => {
      const date = getCompletionDate(booking);

      if (!date) return;

      const index =
        (date.getFullYear() - 2026) * 12 +
        date.getMonth() - 2;

      if (index >= 0 && index < 12) {
        months[index].value += safeNumber(booking.amount);
      }
    });

    return months;
  }, [completedBookings]);

  const highestMonth = Math.max(
    ...monthlyIncome.map((month) => month.value),
    1
  );

  // Chart composition uses projected gross income and estimated tax.
  const grossIncome = projectedFreelanceIncome + additionalIncome;
  const netIncome = estimatedNetIncome;

  const allocationTotal =
    expenses + taxAfterRebate + netIncome;

  const expensePercentage =
    allocationTotal > 0 ? (expenses / allocationTotal) * 100 : 0;

  const taxPercentage =
    allocationTotal > 0 ? (taxAfterRebate / allocationTotal) * 100 : 0;

  const netPercentage =
    allocationTotal > 0 ? (netIncome / allocationTotal) * 100 : 0;

  const stats = [
    {
      label: "Completed booking revenue",
      value: money(completedRevenue),
      detail: `${completedBookings.length} completed bookings`,
      icon: <Wallet size={18} />
    },
    {
      label: "Projected taxable income",
      value: money(taxableIncome),
      detail: "After estimated business expenses",
      icon: <TrendingUp size={18} />
    },
    {
      label: "Estimated annual tax",
      value: money(taxAfterRebate),
      detail: `${effectiveTaxRate.toFixed(2)}% effective rate`,
      icon: <Receipt size={18} />
    },
    {
      label: "Estimated tax still payable",
      value: money(remainingTax),
      detail: "After tax payments already made",
      icon: <Calculator size={18} />
    }
  ];

  return (
    <main className="freelancer-dashboard fet-page">
      <FreelancerHeader />

      <div className="freelancer-dashboard-content fet-content">
        <section className="fet-heading">
          <h1>Estimated Tax & Income</h1>

          <p>
            Understand your completed booking revenue, projected
            taxable income and estimated South African income tax.
          </p>

          <div className="fet-tax-year">
            <span>Tax year</span>
            <strong> {TAX_YEAR} </strong>
            <span>| 1 March 2026 – 28 February 2027</span>
          </div>
        </section>

        {loadError && (
          <div className="fet-error" role="alert">
            <strong>Financial data unavailable</strong>
            <p>{loadError}</p>
            <p>
              Tax calculations are hidden until your bookings
              can be loaded successfully.
            </p>
          </div>
        )}

        <section className="fet-summary-grid">
          {stats.map((stat) => (
            <article className="fet-summary-card" key={stat.label}>
              <div className="fet-card-top">
                <span>{stat.label}</span>
                {stat.icon}
              </div>

              <strong>
                {loading || loadError ? "—" : stat.value}
              </strong>

              <small>{stat.detail}</small>
            </article>
          ))}
        </section>

        <section className="fet-main-grid">
          <article className="fet-breakdown">
            <div className="fet-section-heading">
              <div>
                <h2>Annual tax breakdown</h2>
                <p>Estimated SARS individual income tax</p>
              </div>
              <Receipt size={20} />
            </div>

            {loading ? (
              <p className="fet-empty">Loading financial records...</p>
            ) : loadError ? (
              <p className="fet-empty">
                The tax breakdown is unavailable.
              </p>
            ) : (
              <>
                <div className="fet-breakdown-row">
                  <span>Completed booking revenue</span>
                  <strong>{money(completedRevenue)}</strong>
                </div>

                <div className="fet-breakdown-row">
                  <span>Expected future freelance income</span>
                  <strong>{money(projectedFutureIncome)}</strong>
                </div>

                <div className="fet-breakdown-row">
                  <span>Total projected freelance income</span>
                  <strong>{money(projectedFreelanceIncome)}</strong>
                </div>

                <div className="fet-breakdown-row">
                  <span>Allowable business expenses entered</span>
                  <strong>− {money(expenses)}</strong>
                </div>

                <div className="fet-breakdown-row">
                  <span>Estimated freelance profit</span>
                  <strong>{money(freelanceProfit)}</strong>
                </div>

                <div className="fet-breakdown-row">
                  <span>Other taxable income</span>
                  <strong>{money(additionalIncome)}</strong>
                </div>

                <div className="fet-breakdown-row fet-total-row">
                  <span>Total estimated taxable income</span>
                  <strong>{money(taxableIncome)}</strong>
                </div>

                <div className="fet-breakdown-row">
                  <span>Tax before rebates</span>
                  <strong>{money(taxCalculation.taxBeforeRebate)}</strong>
                </div>

                <div className="fet-breakdown-row">
                  <span>Applicable age-based rebates</span>
                  <strong>− {money(rebate)}</strong>
                </div>

                <div className="fet-breakdown-row fet-total-row">
                  <span>Estimated annual tax liability</span>
                  <strong>{money(taxAfterRebate)}</strong>
                </div>

                <div className="fet-breakdown-row">
                  <span>PAYE / provisional tax already paid</span>
                  <strong>− {money(paidTax)}</strong>
                </div>

                <div className="fet-breakdown-row fet-net-row">
                  <span>
                    {potentialCredit > 0
                      ? "Potential overpayment"
                      : "Estimated tax still payable"}
                  </span>

                  <strong>
                    {money(
                      potentialCredit > 0
                        ? potentialCredit
                        : remainingTax
                    )}
                  </strong>
                </div>

                <p className="fet-bracket-note">
                  Your highest applicable marginal tax bracket is{" "}
                  <strong>{taxCalculation.marginalRate}</strong>.
                  This is not the percentage charged on all your income.
                </p>
              </>
            )}
          </article>

          <article className="fet-calculator">
            <div className="fet-section-heading">
              <div>
                <h2>Tax estimate settings</h2>
                <p>Adjust your annual financial projection</p>
              </div>
              <Calculator size={20} />
            </div>

            <p className="fet-calculator-intro">
              Enter your expected income, qualifying business expenses
              and payments already made to estimate your annual tax.
            </p>

            <div className="fet-form-group">
              <label htmlFor="fet-future-income">
                Expected future freelance income (R)
              </label>

              <input
                id="fet-future-income"
                type="number"
                min="0"
                step="0.01"
                value={futureIncome}
                onChange={(event) => setFutureIncome(event.target.value)}
                disabled={loading || Boolean(loadError)}
              />
              <small>
                Income you expect to earn between now and the end
                of the tax year. Do not include completed bookings again.
              </small>
            </div>

            <div className="fet-form-group">
              <label htmlFor="fet-other-income">
                Other annual taxable income (R)
              </label>

              <input
                id="fet-other-income"
                type="number"
                min="0"
                step="0.01"
                value={otherIncome}
                onChange={(event) => setOtherIncome(event.target.value)}
                disabled={loading || Boolean(loadError)}
              />
              <small>
                Include other taxable income, such as salary.
                Do not enter the same income twice.
              </small>
            </div>

            <div className="fet-form-group">
              <label htmlFor="fet-expenses">
                Allowable business expenses (R)
              </label>

              <input
                id="fet-expenses"
                type="number"
                min="0"
                step="0.01"
                value={businessExpenses}
                onChange={(event) =>
                  setBusinessExpenses(event.target.value)
                }
                disabled={loading || Boolean(loadError)}
              />

              <small>
                Only enter genuine, qualifying business expenses
                supported by records and receipts.
              </small>
            </div>

            <div className="fet-form-group">
              <label htmlFor="fet-tax-paid">
                PAYE / provisional tax already paid (R)
              </label>

              <input
                id="fet-tax-paid"
                type="number"
                min="0"
                step="0.01"
                value={taxAlreadyPaid}
                onChange={(event) => setTaxAlreadyPaid(event.target.value)}
                disabled={loading || Boolean(loadError)}
              />
            </div>

            <div className="fet-form-group">
              <label htmlFor="fet-age">
                Age category at the end of the tax year
              </label>

              <select
                id="fet-age"
                value={ageCategory}
                onChange={(event) => setAgeCategory(event.target.value)}
                disabled={loading || Boolean(loadError)}
              >
                <option value="under65">Under 65</option>
                <option value="65-74">65 to 74</option>
                <option value="75+">75 and older</option>
              </select>
            </div>

            <div className="fet-calculator-result">
              <span>Estimated remaining tax payable</span>
              <strong>
                {loading || loadError ? "—" : money(remainingTax)}
              </strong>
              {potentialCredit > 0 && (
                <small>
                  Your entered payments exceed the estimated liability
                  by {money(potentialCredit)}.
                </small>
              )}
            </div>
          </article>
        </section>

        <section className="fet-visual-grid">
          <article className="fet-chart-card">
            <div className="fet-section-heading">
              <div>
                <h2>Monthly completed booking revenue</h2>
                <p>Revenue recorded by completion month</p>
              </div>
              <TrendingUp size={20} />
            </div>

            {loading || loadError ? (
              <p className="fet-empty">Chart unavailable.</p>
            ) : (
              <div
                className="fet-bar-chart"
                role="img"
                aria-label="Monthly completed booking revenue bar chart"
              >
                {monthlyIncome.map((month) => (
                  <div className="fet-bar-column" key={month.label}>
                    <span className="fet-bar-value">
                      {month.value > 0
                        ? money(month.value)
                        : "—"}
                    </span>

                    <div className="fet-bar-track">
                      <div
                        className="fet-bar"
                        style={{
                          height: `${Math.max(
                            month.value > 0 ? 4 : 0,
                            (month.value / highestMonth) * 100
                          )}%`
                        }}
                      />
                    </div>

                    <span className="fet-bar-label">
                      {month.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="fet-chart-card">
            <div className="fet-section-heading">
              <div>
                <h2>Projected income allocation</h2>
                <p>How your annual income is allocated</p>
              </div>
              <Wallet size={20} />
            </div>

            {loading || loadError ? (
              <p className="fet-empty">Chart unavailable.</p>
            ) : (
              <>
                <div className="fet-allocation-bar">
                  <span
                    className="fet-allocation-expenses"
                    style={{ width: `${expensePercentage}%` }}
                  />
                  <span
                    className="fet-allocation-tax"
                    style={{ width: `${taxPercentage}%` }}
                  />
                  <span
                    className="fet-allocation-net"
                    style={{ width: `${netPercentage}%` }}
                  />
                </div>

                <div className="fet-legend">
                  <div>
                    <span className="fet-dot fet-dot-expenses" />
                    <span>Business expenses</span>
                    <strong>{money(expenses)}</strong>
                  </div>

                  <div>
                    <span className="fet-dot fet-dot-tax" />
                    <span>Estimated annual tax</span>
                    <strong>{money(taxAfterRebate)}</strong>
                  </div>

                  <div>
                    <span className="fet-dot fet-dot-net" />
                    <span>Income after expenses and tax</span>
                    <strong>{money(netIncome)}</strong>
                  </div>
                </div>
              </>
            )}
          </article>
        </section>

        <section className="fet-explanation">
          <div className="fet-section-heading">
            <div>
              <h2>How your tax is calculated</h2>
              <p>South African individual income tax methodology</p>
            </div>
            <ShieldCheck size={20} />
          </div>

          <ol>
            <li>
              <strong>Calculate freelance income.</strong>
              Completed booking revenue is added to your expected
              future freelance income.
            </li>
            <li>
              <strong>Deduct qualifying business expenses.</strong>
              Expenses must meet SARS requirements, including being
              incurred in the production of income and for purposes
              of trade.
            </li>
            <li>
              <strong>Combine taxable income.</strong>
              Your estimated freelance profit is added to other
              taxable income to estimate your annual taxable income.
            </li>
            <li>
              <strong>Apply progressive tax brackets.</strong>
              Different portions of taxable income are taxed at
              different SARS rates. Your highest bracket is your
              marginal rate, not your overall effective rate.
            </li>
            <li>
              <strong>Apply tax rebates.</strong>
              The primary rebate applies to individuals, with
              additional rebates depending on age.
            </li>
            <li>
              <strong>Subtract tax already paid.</strong>
              PAYE and provisional tax payments are deducted from
              the estimated annual liability to calculate the
              remaining amount.
            </li>
          </ol>
        </section>

        <aside className="fet-disclaimer">
          <strong>Important tax and financial information</strong>

          <p>
            This calculator uses the SARS 2026/2027 individual income
            tax brackets and rebates. It is an estimate, not an official
            SARS assessment or tax return.
          </p>

          <p>
            The completed booking figures represent recorded booking
            revenue, not verified payments received. Legacy bookings
            without a completion date use their last updated date as
            an approximate date.
          </p>

          <p>
            The calculator does not currently account for every
            possible deduction, medical tax credit, retirement
            contribution, capital gain, assessed loss, VAT obligation
            or other tax adjustment. Business expenses must be
            allowable under tax legislation and supported by evidence.
          </p>

          <p>
            Provisional tax may apply to freelancers depending on
            their circumstances. This calculator does not determine
            your provisional taxpayer status or calculate official
            IRP6 instalments. Consult SARS or a registered tax
            practitioner before making tax payments.
          </p>

          <p>
            Your entered assumptions are held in page memory only
            and are not saved when you leave or refresh this page.
          </p>

          <p className="fet-source">
            Sources: SARS, Rates of Tax for Individuals (2027 tax year);
            SARS, Individual Deductions; SARS, Taxation in South Africa.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default FreelancerEstimatedTax;
/*
REFERENCES

South African Revenue Service (SARS), 2026a.
Rates of Tax for Individuals: 2027 Tax Year.
Available at:
https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/

South African Revenue Service (SARS), 2026b.
Individual Deductions.
Available at:
https://www.sars.gov.za/individuals/i-need-help-with-my-tax/your-tax-questions-answered/individual-deductions/

South African Revenue Service (SARS), 2026c.
Provisional Tax.
Available at:
https://www.sars.gov.za/types-of-tax/provisional-tax/

South African Revenue Service (SARS), 2026d.
Taxation in South Africa: Allowable Deductions.
Available at:
https://www.sars.gov.za/wp-content/uploads/Ops/Guides/Legal-Pub-Guide-Gen01-Taxation-in-South-Africa.pdf

*/