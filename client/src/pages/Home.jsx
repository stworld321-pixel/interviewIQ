import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BsArrowRight,
  BsBarChart,
  BsCheckCircle,
  BsClock,
  BsFileEarmarkPdf,
  BsFileText,
  BsGrid,
  BsMic,
  BsPersonBadge,
  BsShare,
  BsTerminal,
} from "react-icons/bs";
import logo from "../assets/logo.png";

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
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <img src={logo} alt="Brand logo" className="w-50 h-50 object-contain" />
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium hover:text-[#1E88E5] transition-colors" href="#how-it-works">
              How It Works
            </a>
            <a className="text-sm font-medium hover:text-[#1E88E5] transition-colors" href="#features">
              Features
            </a>
            <a className="text-sm font-medium hover:text-[#1E88E5] transition-colors" href="#pricing">
              Pricing
            </a>
            <a className="text-sm font-medium hover:text-[#1E88E5] transition-colors" href="#about">
              About
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:block text-sm font-bold hover:text-[#1E88E5] transition-colors px-4 py-2"
            >
              Log In
            </button>
            <button
              onClick={() => gateAndGo("/interview")}
              className="bg-[#0B3C6D] hover:bg-[#1E88E5] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-[#1E88E5]/25"
            >
              Start Interview
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-20 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col gap-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E88E5]/10 text-[#0B3C6D] text-xs font-bold uppercase tracking-wider w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E88E5] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E88E5]"></span>
                </span>
                New: Resume-Based Analysis
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                AI-Powered <span className="text-[#1E88E5]">Smart Interview</span> Platform
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Master your next job interview with our advanced AI-driven simulation. Get real-time feedback, detailed performance analytics, and professional coaching.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => gateAndGo("/interview")}
                  className="bg-[#0B3C6D] hover:bg-[#1E88E5] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-[#1E88E5]/30 flex items-center gap-2"
                >
                  Start Interview <BsArrowRight />
                </button>
                <button
                  onClick={() => gateAndGo("/history")}
                  className="bg-white border border-slate-200 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-all"
                >
                  View History
                </button>
              </div>
            </motion.div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#0B3C6D]/25 via-[#1E88E5]/20 to-transparent rounded-3xl blur-2xl"></div>
              <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
                <div className="flex items-center justify-center gap-1 h-32 w-full">
                  {[8, 16, 24, 32, 28, 20, 12, 6].map((h, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-full ${i === 3 ? "bg-[#1E88E5]" : "bg-[#0B3C6D]/50"}`}
                      style={{ height: `${h * 4}px` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
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

      <footer className="border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <img src={logo} alt="Brand logo" className="w-40 h-14 object-contain" />
              </div>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                AI interview simulation platform built to bridge the gap between preparation and professional success.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">Platform</h5>
              <ul className="space-y-4">
                <li><a className="text-sm hover:text-[#1E88E5] transition-colors" href="#how-it-works">How It Works</a></li>
                <li><a className="text-sm hover:text-[#1E88E5] transition-colors" href="#features">Interview Modes</a></li>
                <li><a className="text-sm hover:text-[#1E88E5] transition-colors" href="#pricing">Pricing Plans</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">Company</h5>
              <ul className="space-y-4">
                <li><button onClick={() => navigate("/about")} className="text-sm hover:text-[#1E88E5] transition-colors">About Us</button></li>
                <li><button onClick={() => navigate("/contact")} className="text-sm hover:text-[#1E88E5] transition-colors">Contact</button></li>
                <li><button onClick={() => navigate("/pricing")} className="text-sm hover:text-[#1E88E5] transition-colors">Plans</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">© 2026 Hireloop. All rights reserved.</p>
            <div className="flex gap-6">
              <button className="text-slate-400 hover:text-[#1E88E5] transition-colors"><BsGrid size={18} /></button>
              <button className="text-slate-400 hover:text-[#1E88E5] transition-colors"><BsShare size={18} /></button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Home;


