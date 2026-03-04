import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-10">
          <p className="text-sm font-semibold text-[#1E88E5] uppercase tracking-widest">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B3C6D] mt-3">Terms of Service</h1>
          <p className="text-sm text-slate-500 mt-3">Last updated: March 4, 2026</p>

          <div className="mt-8 space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-slate-900">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By using Hireloop, you agree to these Terms of Service and all applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">2. Service Description</h2>
              <p className="mt-2">
                Hireloop provides AI-assisted mock interview tools, reports, and related preparation resources.
                We may improve, modify, or discontinue features at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">3. Account Responsibilities</h2>
              <p className="mt-2">
                You are responsible for maintaining account confidentiality and for all activity performed under
                your account credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">4. Payments and Credits</h2>
              <p className="mt-2">
                Paid plans and credits are subject to pricing displayed at checkout. Fraudulent, unauthorized,
                or chargeback-abusive activity may result in account suspension.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">5. Acceptable Use</h2>
              <p className="mt-2">
                You agree not to misuse the platform, attempt unauthorized access, or upload harmful/illegal
                content through any platform feature.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">6. Intellectual Property</h2>
              <p className="mt-2">
                Platform content, design, and software are protected by intellectual property laws. You may not
                copy, reverse engineer, or redistribute core platform assets without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">7. Disclaimer and Limitation of Liability</h2>
              <p className="mt-2">
                Services are provided on an "as available" basis. We do not guarantee interview outcomes, job
                offers, or uninterrupted access.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">8. Contact</h2>
              <p className="mt-2">
                For legal or service questions, contact us at <span className="font-medium">support@localjobshub.in</span>
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

export default TermsOfService;
