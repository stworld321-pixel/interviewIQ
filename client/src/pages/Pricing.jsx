import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";

const plans = [
  {
    id: "free",
    name: "Free",
    amount: 0,
    credits: 100,
    tagline: "Know where you stand",
    description: "Perfect to explore the platform and run your first interview drills.",
    reportAccess: "Basic score + short question feedback",
    features: [
      "100 interview credits",
      "Basic report",
      "Short feedback per question",
      "History access",
    ],
    ctaLabel: "Current Default Plan",
    default: true,
  },
  {
    id: "starter",
    name: "Starter",
    amount: 199,
    credits: 220,
    tagline: "Fix mistakes fast",
    description: "Structured diagnosis for consistent weekly preparation.",
    reportAccess: "Diagnostic report + keyword gap insights",
    features: [
      "220 interview credits",
      "Detailed scoring",
      "Keyword usage analysis",
      "Improvement suggestions",
    ],
    ctaLabel: "Proceed to Pay",
  },
  {
    id: "pro",
    name: "Pro",
    amount: 599,
    credits: 900,
    tagline: "Train like final round",
    description: "Advanced coaching depth for high-stakes interview readiness.",
    reportAccess: "Coaching intelligence + roadmap + predictive insights",
    features: [
      "900 interview credits",
      "Advanced report intelligence",
      "Personalized 7-day plan",
      "Model answer improvements",
    ],
    badge: "Best Value",
    ctaLabel: "Proceed to Pay",
  },
];

function Pricing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState("");

  const selectedPlanObject = useMemo(
    () => plans.find((p) => p.id === selectedPlan) || plans[1],
    [selectedPlan]
  );

  const handlePayment = async (plan) => {
    try {
      setError("");
      setLoadingPlan(plan.id);

      if (plan.id === "free") {
        setError("Free plan is already available by default.");
        return;
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey || razorpayKey.includes("add your")) {
        throw new Error("Razorpay key is missing in frontend env (VITE_RAZORPAY_KEY_ID).");
      }
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please refresh and try again.");
      }
      const token = localStorage.getItem("token");
      const requestConfig = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      };

      const orderRes = await axios.post(
        ServerUrl + "/api/payment/order",
        { planId: plan.id },
        requestConfig
      );

      const options = {
        key: razorpayKey,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Hireloop",
        description: `${plan.name} - ${plan.credits} credits`,
        order_id: orderRes.data.id,
        theme: { color: "#0B3C6D" },
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              ServerUrl + "/api/payment/verify",
              response,
              requestConfig
            );
            dispatch(setUserData(verifyRes.data.user));
            localStorage.setItem("userData", JSON.stringify(verifyRes.data.user));
            alert(`${plan.name} activated. Credits added successfully.`);
            navigate("/history");
          } catch (verifyError) {
            setError(verifyError?.response?.data?.message || "Payment verification failed.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        const failMessage =
          response?.error?.description ||
          response?.error?.reason ||
          "Payment failed. Please try again.";
        setError(failMessage);
      });
      rzp.open();
    } catch (e) {
      if (e?.response?.status === 401) {
        setError("Session expired. Please login again to continue payment.");
        navigate("/login", { state: { from: "/pricing" } });
        return;
      }
      setError(e?.response?.data?.message || e?.message || "Oops, something went wrong. Payment failed.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#0B3C6D] to-[#1E88E5] text-white p-8 md:p-10">
          <h1 className="text-4xl md:text-5xl font-semibold">Choose your interview growth engine</h1>
          <p className="mt-4 text-blue-100 max-w-3xl">
            Free helps you start. Starter diagnoses your gaps. Pro gives coaching-level depth that drives faster interview outcomes.
          </p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <motion.article
                key={plan.id}
                whileHover={{ y: -4 }}
                className={`rounded-3xl border p-7 transition ${
                  isSelected ? "border-[#0B3C6D] bg-white shadow-xl" : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                  {plan.badge && (
                    <span className="text-xs bg-[#eaf2fb] text-[#0B3C6D] px-3 py-1 rounded-full">{plan.badge}</span>
                  )}
                </div>

                <p className="mt-3 text-sm font-semibold text-[#1E88E5]">{plan.tagline}</p>
                <p className="mt-2 text-3xl font-semibold">Rs {plan.amount}</p>
                <p className="text-slate-500 text-sm mt-1">{plan.credits} credits</p>
                <p className="mt-2 text-xs font-medium text-[#0B3C6D] bg-[#eef5ff] border border-[#d4e4fa] inline-block px-3 py-1 rounded-full">
                  Report: {plan.reportAccess}
                </p>
                <p className="mt-4 text-sm text-slate-600">{plan.description}</p>

                <div className="mt-6 space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                      <FaCheckCircle className="text-[#1E88E5]" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.default ? (
                  <button disabled className="w-full mt-7 py-3 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed">
                    {plan.ctaLabel}
                  </button>
                ) : (
                  <button
                    onClick={() => (isSelected ? handlePayment(plan) : setSelectedPlan(plan.id))}
                    disabled={loadingPlan === plan.id}
                    className={`w-full mt-7 py-3 rounded-xl font-medium transition ${
                      isSelected ? "bg-[#0B3C6D] text-white hover:bg-[#1E88E5]" : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    } disabled:opacity-70`}
                  >
                    {loadingPlan === plan.id ? "Processing..." : isSelected ? plan.ctaLabel : "Select Plan"}
                  </button>
                )}
              </motion.article>
            );
          })}
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
          <h3 className="text-xl font-semibold text-slate-900">Plan comparison (what gets better)</h3>
          <p className="text-sm text-slate-500 mt-1">
            Each tier uses a deeper analysis engine, richer report schema, and stronger interview guidance.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="text-left py-3">Plan</th>
                  <th className="text-left py-3">Credits</th>
                  <th className="text-left py-3">Report Depth</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-slate-100">
                    <td className="py-3 font-medium text-slate-800">{plan.name}</td>
                    <td className="py-3 text-slate-600">{plan.credits}</td>
                    <td className="py-3 text-slate-600">{plan.reportAccess}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-xl border border-[#d9e8fb] bg-[#f4f8ff] p-4 text-sm text-slate-700">
            Selected plan: <span className="font-semibold text-[#0B3C6D]">{selectedPlanObject.name}</span> ·
            {" "}This plan uses a <span className="font-semibold">{selectedPlanObject.reportAccess}</span> report pipeline.
          </div>
        </section>

        {error && <p className="mt-6 text-center text-sm text-red-600 font-medium">{error}</p>}
      </main>

      <Footer />
    </div>
  );
}

export default Pricing;
