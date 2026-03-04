import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ServerUrl } from "../App";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      setLoading(true);
      const res = await axios.post(ServerUrl + "/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      setMessage(res.data?.message || "If this email exists, reset instructions were sent.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-14">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-[#0B3C6D]">Forgot Password</h1>
          <p className="text-slate-600 mt-2">
            Enter your account email. We will send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1E88E5]/30 outline-none"
            />
            {message && <p className="text-sm text-green-700">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0B3C6D] hover:bg-[#1E88E5] text-white font-semibold transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Remembered your password?{" "}
            <Link to="/login" className="text-[#0B3C6D] font-semibold hover:underline">
              Go to Login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ForgotPassword;

