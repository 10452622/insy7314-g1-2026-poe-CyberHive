
import React, { useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import { fetchFreelancerOrders } from "../services/api";
import FreelancerHeader from "../components/FreelancerHeader";
import "../styles/FreelancerEstimatedTax.css";

const money = (amount) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function FreelancerEstimatedTax() {
  const [orders, setOrders] = useState([]);
  const [deductions, setDeductions] = useState("0");
  const [taxRate, setTaxRate] = useState("20");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Fetch the freelancer's bookings from the existing API.
  useEffect(() => {
    let isCurrent = true;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetchFreelancerOrders();

        if (!isCurrent) return;

        // Support the API response formats used by common controllers.
        const bookings = Array.isArray(response)
          ? response
          : Array.isArray(response?.bookings)
          ? response.bookings
          : Array.isArray(response?.orders)
          ? response.orders
          : Array.isArray(response?.data)
          ? response.data
          : null;

        if (!bookings) {
          throw new Error(
            "The bookings API returned an unexpected response format."
          );
        }

        setOrders(bookings);
      } catch (error) {
        if (!isCurrent) return;

        setOrders([]);
        setLoadError(
          error?.message ||
            "Your bookings could not be loaded. Please try again."
        );
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      isCurrent = false;
    };
  }, []);

  // South African tax year: 1 March to the end of February.
  const now = new Date();

  const taxYearStartYear =
    now.getMonth() >= 2
      ? now.getFullYear()
      : now.getFullYear() - 1;

  const taxYearLabel =
    `${taxYearStartYear}/${taxYearStartYear + 1}`;

  const taxYearStart = new Date(taxYearStartYear, 2, 1);
  const nextTaxYearStart = new Date(taxYearStartYear + 1, 2, 1);

  // Include bookings marked as completed.
  const completedOrders = orders.filter(
    (order) =>
      String(order.status || "").trim().toUpperCase() === "COMPLETED"
  );

  // Keep only completed bookings within the current tax year.
  const yearlyOrders = completedOrders.filter((order) => {
    // completedAt is recommended for accurate tax-year reporting.
    // The supplied Booking schema does not yet contain completedAt,
    // so updatedAt and createdAt are fallbacks.
    const dateValue =
      order.completedAt ||
      order.updatedAt ||
      order.createdAt;

    if (!dateValue) return false;

    const orderDate = new Date(dateValue);

    return (
      !Number.isNaN(orderDate.getTime()) &&
      orderDate >= taxYearStart &&
      orderDate < nextTaxYearStart
    );
  });

  // Sum the booking amounts for the selected tax year.
  const totalIncome = yearlyOrders.reduce(
    (total, order) => total + (Number(order.amount) || 0),
    0
  );

  // Keep user-entered deductions within the valid range.
  const deductionAmount = Math.min(
    totalIncome,
    Math.max(0, Number(deductions) || 0)
  );

  const taxableIncome = Math.max(
    0,
    totalIncome - deductionAmount
  );

  // This is an illustrative rate, not an official SARS tax calculation.
  const effectiveTaxRate = Math.min(
    100,
    Math.max(0, Number(taxRate) || 0)
  );

  const estimatedTax =
    taxableIncome * (effectiveTaxRate / 100);

  const afterTaxIncome =
    totalIncome - deductionAmount - estimatedTax;

  const stats = [
    {
      label: "Total Income",
      value: money(totalIncome),
      detail: `Completed bookings in ${taxYearLabel}`,
    },
    {
      label: "Estimated Tax",
      value: money(estimatedTax),
      detail: `${effectiveTaxRate}% estimated rate`,
    },
    {
      label: "After-Tax Income",
      value: money(afterTaxIncome),
      detail: "After deductions and estimated tax",
    },
  ];

  return (
    <main className="freelancer-dashboard">
      <FreelancerHeader />

      <div className="freelancer-dashboard-content">
        <section className="freelancer-welcome">
          <p className="freelancer-eyebrow">
            Financial overview
          </p>

          <h1>Estimated Tax</h1>

          <p>
            Review your completed booking income and estimate
            how much you may need to set aside for tax.
          </p>

          <p>
            <strong>Tax year:</strong> {taxYearLabel}
          </p>
        </section>

        {loadError && (
          <div
            className="freelancer-dashboard-error"
            role="alert"
          >
            <p>{loadError}</p>
            <p>
              Your tax figures are unavailable until your
              bookings can be loaded successfully.
            </p>
          </div>
        )}

        <section
          className="freelancer-stat-grid fet-stat-grid"
          aria-label="Estimated tax summary"
        >
          {stats.map((stat) => (
            <article
              className="freelancer-stat"
              key={stat.label}
            >
              <span className="freelancer-stat-label">
                {stat.label}
              </span>

              <strong className="freelancer-stat-value">
                {loading || loadError ? "—" : stat.value}
              </strong>

              <span className="freelancer-stat-detail">
                {stat.detail}
              </span>
            </article>
          ))}
        </section>

        <section className="freelancer-dashboard-panels fet-panels">
          <article className="freelancer-panel fet-breakdown-panel">
            <div className="freelancer-panel-heading">
              <h2>Tax Breakdown</h2>
            </div>

            {loading ? (
              <p className="freelancer-empty-state">
                Loading your bookings...
              </p>
            ) : loadError ? (
              <p className="freelancer-empty-state">
                Tax breakdown unavailable. Please check your
                connection and try again.
              </p>
            ) : (
              <div className="fet-breakdown">
                <div className="fet-breakdown-row">
                  <span>Completed bookings</span>
                  <strong>{yearlyOrders.length}</strong>
                </div>

                <div className="fet-breakdown-row">
                  <span>Total booking income</span>
                  <strong>{money(totalIncome)}</strong>
                </div>

                <div className="fet-breakdown-row">
                  <span>Estimated deductions</span>
                  <strong>
                    − {money(deductionAmount)}
                  </strong>
                </div>

                <div className="fet-breakdown-row">
                  <span>Estimated taxable income</span>
                  <strong>{money(taxableIncome)}</strong>
                </div>

                <div className="fet-breakdown-row">
                  <span>Estimated tax rate</span>
                  <strong>{effectiveTaxRate}%</strong>
                </div>

                <div className="fet-breakdown-row fet-tax-total">
                  <span>Estimated tax</span>
                  <strong>{money(estimatedTax)}</strong>
                </div>

                <div className="fet-breakdown-row fet-income-total">
                  <span>Income after estimate</span>
                  <strong>{money(afterTaxIncome)}</strong>
                </div>

                {yearlyOrders.length === 0 && (
                  <p className="freelancer-empty-state">
                    No completed bookings were found for this
                    tax year.
                  </p>
                )}
              </div>
            )}
          </article>

          <article className="freelancer-panel fet-calculator-panel">
            <div className="freelancer-panel-heading">
              <h2>
                <Calculator
                  size={19}
                  aria-hidden="true"
                />
                Adjust Your Estimate
              </h2>
            </div>

            <p className="fet-calculator-description">
              Adjust the illustrative deductions and tax rate
              to see how they affect your estimated remaining
              income.
            </p>

            <div className="fet-form-group">
              <label htmlFor="fet-deductions">
                Estimated deductions (R)
              </label>

              <input
                id="fet-deductions"
                type="number"
                min="0"
                max={totalIncome}
                step="0.01"
                value={deductions}
                onChange={(event) =>
                  setDeductions(event.target.value)
                }
                disabled={loading || Boolean(loadError)}
              />

              <small>
                Deductions are capped at your total recorded
                booking income.
              </small>
            </div>

            <div className="fet-form-group">
              <label htmlFor="fet-tax-rate">
                Estimated tax rate (%)
              </label>

              <input
                id="fet-tax-rate"
                type="number"
                min="0"
                max="100"
                step="1"
                value={taxRate}
                onChange={(event) =>
                  setTaxRate(event.target.value)
                }
                disabled={loading || Boolean(loadError)}
              />

              <small>
                This is a simplified, user-adjustable rate.
                It is not your official SARS tax rate.
              </small>
            </div>

            <div className="fet-calculator-result">
              <span>Estimated amount remaining</span>

              <strong>
                {loading || loadError
                  ? "—"
                  : money(afterTaxIncome)}
              </strong>
            </div>
          </article>
        </section>

        <aside className="fet-disclaimer">
          <strong>Important note</strong>

          <p>
            This page provides a simplified estimate based on
            completed bookings recorded for the current South
            African tax year ({taxYearLabel}). Booking amounts
            may not reflect the money actually received after
            platform fees, refunds or other adjustments.
          </p>

          <p>
            The calculation uses a flat illustrative rate and
            user-entered deductions. It does not calculate
            official South African tax liability or account
            for all applicable tax brackets, rebates, exemptions
            or allowable deductions. Consult SARS guidance or
            a qualified tax practitioner for your actual tax
            obligations.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default FreelancerEstimatedTax;
