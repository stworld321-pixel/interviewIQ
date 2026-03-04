import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function RefundCancellationPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-10">
          <p className="text-sm font-semibold text-[#1E88E5] uppercase tracking-widest">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B3C6D] mt-3">Refund & Cancellation Policy</h1>
          <p className="text-sm text-slate-500 mt-3">Last updated: March 4, 2026</p>

          <div className="mt-8 space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-slate-900">1. Digital Service Nature</h2>
              <p className="mt-2">
                Hireloop provides digital interview preparation services and usage-based credits. Once credits are
                consumed for interviews or reports, those sessions are considered delivered.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">2. Cancellation</h2>
              <p className="mt-2">
                Users may stop using the service at any time. There is no lock-in contract for platform usage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">3. Refund Eligibility</h2>
              <p className="mt-2">
                Refund requests are reviewed for duplicate transactions, failed top-ups with confirmed debit,
                or technical non-delivery caused by platform-side faults.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">4. Non-Refundable Cases</h2>
              <p className="mt-2">
                Credits already consumed, user-side network issues, or dissatisfaction without technical defects
                are generally not eligible for refund.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">5. Refund Processing</h2>
              <p className="mt-2">
                If approved, refund is initiated to the original payment source and typically reflects within
                5-10 business days depending on banking/payment gateway timelines.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">6. Business Details</h2>
              <p className="mt-2"><span className="font-medium">Business Name:</span> Hireloop (LocalJobsHub)</p>
              <p><span className="font-medium">Support Email:</span> support@localjobshub.in</p>
              <p><span className="font-medium">Phone:</span> +91 90879 62062</p>
              <p><span className="font-medium">Address:</span> 3,2nd aruthura nagar, puducherry - 9</p>
              <p><span className="font-medium">GSTIN:</span> To be updated</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default RefundCancellationPolicy;

