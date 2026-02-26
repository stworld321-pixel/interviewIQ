import React from "react";
import { motion } from "motion/react";
import { BsBullseye, BsPeople, BsShieldCheck } from "react-icons/bs";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const values = [
  {
    icon: <BsBullseye size={20} />,
    title: "Mission Driven",
    desc: "We focus on one goal: help candidates perform better in real interviews.",
  },
  {
    icon: <BsPeople size={20} />,
    title: "Candidate First",
    desc: "Our experience is designed for students, freshers, and professionals switching roles.",
  },
  {
    icon: <BsShieldCheck size={20} />,
    title: "Clear Feedback",
    desc: "You get practical insights you can apply immediately in your next interview.",
  },
];

function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[28px] border border-slate-200 bg-white p-8 md:p-12"
        >
          <p className="text-[#135bec] text-sm font-medium">About InterviewIQ.AI</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold leading-tight">
            We build smarter interview practice for serious job seekers.
          </h1>
          <p className="mt-5 text-slate-600 max-w-3xl">
            InterviewIQ.AI is an AI-powered mock interview platform that helps users practice with realistic questions,
            time pressure, and actionable performance reports. We combine role-based simulation with structured scoring so
            candidates can improve communication, confidence, and technical depth.
          </p>
        </motion.section>

        <section className="grid md:grid-cols-3 gap-5 mt-10">
          {values.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#135bec] flex items-center justify-center">
                {item.icon}
              </div>
              <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </motion.article>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default AboutUs;
