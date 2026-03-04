import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BsBarChart,
  BsCheckCircle,
  BsClock,
  BsFileEarmarkPdf,
  BsFileText,
  BsGrid,
  BsMic,
  BsPersonBadge,
  BsTerminal,
} from "react-icons/bs";
import heroImage from "../assets/MM.png";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const gateAndGo = (path) => {
    if (!userData) {
      navigate("/login", { state: { from: path } });
      return;
    }
    navigate(path);
  };

  return (
    <div className="bg-gradient-to-b from-white via-[#f6f9ff] to-[#eef5ff] text-slate-900">
      <Navbar />

      <main>
        <section className="relative pt-16 pb-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#1E88E5]/20 blur-3xl"></div>
            <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-[#F97316]/15 blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col gap-8 lg:col-span-5"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#1E88E5]/30 bg-white/80 px-4 py-2 text-xs font-semibold text-[#0B3C6D] shadow-sm">
                Trusted by job seekers across HR and technical roles
              </div>

              <h1 className="text-3xl lg:text-5xl font-black leading-[1.1] tracking-tight text-[#0B3C6D]">
                Practice <span className="text-[#F97316]">AI Mock Interviews</span> Before Your Next Job
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Prepare for real job interviews with our free AI mock interview tool. Answer HR and technical questions, upload your resume, and receive an instant performance report on communication, confidence, and knowledge.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => gateAndGo("/interview")}
                  className="bg-[#0B3C6D] hover:bg-[#1E88E5] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-[#1E88E5]/30 flex items-center gap-2"
                >
                  🚀 Start Free Interview
                </button>
                <p className="text-sm text-slate-500">No credit card required</p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-md">
                <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                  <p className="text-lg font-bold text-[#0B3C6D]">100+</p>
                  <p className="text-xs text-slate-500">Free Credits</p>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                  <p className="text-lg font-bold text-[#0B3C6D]">AI</p>
                  <p className="text-xs text-slate-500">HR + Technical</p>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                  <p className="text-lg font-bold text-[#0B3C6D]">Instant</p>
                  <p className="text-xs text-slate-500">Report</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="relative lg:col-span-7"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#0B3C6D]/30 via-[#1E88E5]/20 to-[#F97316]/10 rounded-3xl blur-2xl"></div>
              <div className="relative rounded-[28px] border border-slate-200 bg-white p-3 shadow-2xl overflow-hidden min-h-[320px] md:min-h-[430px]">
                <img
                  src={heroImage}
                  alt="AI mock interview assistant"
                  className="w-full h-full rounded-2xl object-cover object-center"
                />
              </div>
              <div className="absolute -left-6 top-6 rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-lg">
                <p className="text-xs text-slate-500">Live Analysis</p>
                <p className="text-sm font-semibold text-[#0B3C6D]">Confidence: 92%</p>
              </div>
              <div className="absolute -right-6 bottom-8 rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-lg">
                <p className="text-xs text-slate-500">Resume Match</p>
                <p className="text-sm font-semibold text-[#0B3C6D]">Role Relevance: High</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-white" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-slate-600">Three simple steps to interview excellence.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BsPersonBadge />,
                  title: "Role & Experience",
                  desc: "Customize the interview to your target role and seniority level for relevant practice.",
                },
                {
                  icon: <BsMic />,
                  title: "Smart Voice Interview",
                  desc: "Engage with a responsive AI interviewer that adapts naturally to your answers.",
                },
                {
                  icon: <BsClock />,
                  title: "Timer-Based Simulation",
                  desc: "Practice under pressure using realistic time constraints and interview flow.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-8 rounded-2xl bg-[#f6f6f8] border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="size-12 bg-[#1E88E5]/10 text-[#0B3C6D] rounded-xl flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-4">Advanced AI Capabilities</h2>
              <p className="text-slate-600">Powerful tools designed to give you a competitive edge.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <BsBarChart />, title: "AI Answer Evaluation", desc: "Instant feedback on content, structure, and keyword relevance." },
                { icon: <BsFileText />, title: "Resume-Based Interview", desc: "Upload your CV and generate questions tailored to your profile." },
                { icon: <BsFileEarmarkPdf />, title: "Downloadable PDF Report", desc: "Get a complete session breakdown to study and improve." },
                { icon: <BsClock />, title: "History & Analytics", desc: "Track your growth over time with visual progress and logs." },
                { icon: <BsGrid />, title: "Multiple Interview Modes", desc: "Switch between behavioral and technical interview practice modes." },
                { icon: <BsMic />, title: "Confidence Detection", desc: "Analyze tone and delivery speed to improve speaking confidence." },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group p-8 rounded-2xl border border-slate-200 hover:border-[#1E88E5] transition-colors bg-white"
                >
                  <div className="text-[#1E88E5] text-3xl mb-4">{feature.icon}</div>
                  <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#0B3C6D] blur-[120px]"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1E88E5] blur-[120px]"></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-px bg-slate-800 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <div className="p-12 lg:p-16 bg-slate-900 flex flex-col items-start gap-6">
                <div className="size-16 bg-[#0B3C6D]/20 text-[#1E88E5] rounded-2xl flex items-center justify-center mb-4">
                  <BsPersonBadge size={30} />
                </div>
                <h3 className="text-3xl font-bold tracking-tight">HR Interview Mode</h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Focus on behavioral patterns, culture fit, and soft skills with scenario-based prompts.
                </p>
                <ul className="space-y-3">
                  {["Behavioral focus", "Conflict resolution", "Leadership potential"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <BsCheckCircle className="text-[#1E88E5] text-sm" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-12 lg:p-16 bg-slate-900 flex flex-col items-start gap-6">
                <div className="size-16 bg-[#0B3C6D]/20 text-[#1E88E5] rounded-2xl flex items-center justify-center mb-4">
                  <BsTerminal size={30} />
                </div>
                <h3 className="text-3xl font-bold tracking-tight">Technical Interview Mode</h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Evaluate role-specific knowledge, system design understanding, and problem solving under pressure.
                </p>
                <ul className="space-y-3">
                  {["Depth of knowledge", "System design analysis", "Coding logic verification"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <BsCheckCircle className="text-[#1E88E5] text-sm" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 border-t border-slate-200" id="about">
          <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center gap-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight max-w-2xl">Prepare Smarter. Perform Better.</h2>
            <p className="text-slate-600 text-xl max-w-2xl">
              Join professionals using Hireloop to improve consistency and confidence in real interviews.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => gateAndGo("/interview")}
                className="bg-[#0B3C6D] hover:bg-[#1E88E5] text-white font-bold px-10 py-5 rounded-2xl transition-all shadow-xl shadow-[#1E88E5]/30 text-lg"
              >
                Launch Your Free Interview
              </button>
              <button
                onClick={() => navigate("/about")}
                className="bg-white border border-slate-200 font-bold px-8 py-5 rounded-2xl hover:bg-slate-50 transition"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

    </div>
  );
}

export default Home;
