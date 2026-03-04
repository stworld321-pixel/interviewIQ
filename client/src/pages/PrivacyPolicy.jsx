import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-10">
          <p className="text-sm font-semibold text-[#1E88E5] uppercase tracking-widest">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B3C6D] mt-3">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mt-3">Last updated: March 4, 2026</p>

          <div className="mt-8 space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-slate-900">1. Information We Collect</h2>
              <p className="mt-2">
                We collect account details (name, email), interview session inputs, transcript data,
                performance analytics, payment transaction references, and support communication records.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">2. How We Use Your Information</h2>
              <p className="mt-2">
                We use your data to provide interview simulations, generate reports, improve platform quality,
                process payments, support account security, and respond to support requests.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">3. Payments</h2>
              <p className="mt-2">
                Payments are handled through secure third-party providers (such as Razorpay). We do not store
                full card details on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">4. Data Sharing</h2>
              <p className="mt-2">
                We do not sell your personal data. We may share limited data with service providers required
                to operate the product (hosting, email, analytics, and payment processing).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">5. Data Retention</h2>
              <p className="mt-2">
                We retain data for as long as your account is active or as required for legal, security, and
                billing obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">6. Security</h2>
              <p className="mt-2">
                We use reasonable technical and organizational safeguards to protect user data. No method of
                storage or transmission is fully risk-free.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">7. Your Rights</h2>
              <p className="mt-2">
                You may request access, correction, or deletion of account data by contacting our support team.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">8. Contact</h2>
              <p className="mt-2">
                For privacy questions, contact us at <span className="font-medium">support@localjobshub.in</span>
                {" "}or +91 90879 62062.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">9. Business Details</h2>
              <p className="mt-2"><span className="font-medium">Business Name:</span> Hireloop (LocalJobsHub)</p>
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

export default PrivacyPolicy;
