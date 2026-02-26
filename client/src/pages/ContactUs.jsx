import React, { useState } from "react";
import { motion } from "motion/react";
import { BsEnvelope, BsGeoAlt, BsTelephone } from "react-icons/bs";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid lg:grid-cols-5 gap-6"
        >
          <div className="lg:col-span-2 rounded-3xl bg-slate-900 text-white p-7 md:p-8">
            <h1 className="text-3xl font-semibold">Contact Us</h1>
            <p className="mt-3 text-slate-300">
              Have questions about plans, credits, or support? Send us a message.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <BsEnvelope className="mt-1 text-[#1E88E5]" />
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p>support@hireloop.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BsTelephone className="mt-1 text-[#1E88E5]" />
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BsGeoAlt className="mt-1 text-[#1E88E5]" />
                <div>
                  <p className="text-sm text-slate-400">Location</p>
                  <p>Chennai, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-7 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                />
                <input
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  type="email"
                  placeholder="Your email"
                  required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <input
                value={form.subject}
                onChange={(e) => updateField("subject", e.target.value)}
                placeholder="Subject"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              />

              <textarea
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                rows={6}
                placeholder="Write your message"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              />

              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-[#0B3C6D] text-white hover:bg-[#1E88E5] transition"
              >
                Send Message
              </button>
            </form>

            {submitted && (
              <p className="mt-4 text-sm text-[#0B3C6D]">
                Thanks. Your message has been recorded. We will get back to you soon.
              </p>
            )}
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}

export default ContactUs;

