import React, { useState } from "react";
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
    price: "Rs 0",
    credits: 100,
    description: "Best for trying the platform and first interview practice.",
    features: ["100 interview credits", "Basic report", "Standard feedback", "History access"],
    default: true,
  },
  {
    id: "basic",
    name: "Starter",
    price: "Rs 100",
    credits: 150,
    description: "For weekly preparation with more attempts and richer practice.",
    features: ["150 interview credits", "Detailed scoring", "Performance insights", "Priority generation"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "Rs 500",
    credits: 650,
    description: "Ideal for serious job preparation and heavy interview drills.",
    features: ["650 interview credits", "Advanced feedback", "Progress depth reports", "Fastest queue"],
    badge: "Best Value",
  },
];

function Pricing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id);
      const amount = plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0;

      const result = await axios.post(
        ServerUrl + "/api/payment/order",
        {
          planId: plan.id,
          amount,
          credits: plan.credits,
        },
        { withCredentials: true }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: "INR",
        name: "InterviewIQ.AI",
        description: `${plan.name} - ${plan.credits} credits`,
        order_id: result.data.id,
        theme: { color: "#111827" },
        handler: async function (response) {
          const verifypay = await axios.post(
            ServerUrl + "/api/payment/verify",
            response,
            { withCredentials: true }
          );
          dispatch(setUserData(verifypay.data.user));
          alert("Payment successful. Credits added.");
          navigate("/");
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-10">
          <h1 className="text-4xl md:text-5xl font-semibold">Simple pricing, flexible credits</h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Start free, then scale your mock interview sessions based on your preparation pace.
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
                  isSelected ? "border-slate-900 bg-white shadow-xl" : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                  {plan.badge && (
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">{plan.badge}</span>
                  )}
                </div>

                <p className="mt-4 text-3xl font-semibold">{plan.price}</p>
                <p className="text-slate-500 text-sm mt-1">{plan.credits} credits</p>
                <p className="mt-4 text-sm text-slate-600">{plan.description}</p>

                <div className="mt-6 space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                      <FaCheckCircle className="text-emerald-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.default ? (
                  <button disabled className="w-full mt-7 py-3 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed">
                    Current Default Plan
                  </button>
                ) : (
                  <button
                    onClick={() => (isSelected ? handlePayment(plan) : setSelectedPlan(plan.id))}
                    disabled={loadingPlan === plan.id}
                    className={`w-full mt-7 py-3 rounded-xl font-medium transition ${
                      isSelected ? "bg-black text-white hover:opacity-90" : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    } disabled:opacity-70`}
                  >
                    {loadingPlan === plan.id ? "Processing..." : isSelected ? "Proceed to Pay" : "Select Plan"}
                  </button>
                )}
              </motion.article>
            );
          })}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Pricing;
