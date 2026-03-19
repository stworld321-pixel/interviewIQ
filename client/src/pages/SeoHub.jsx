import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { seoPages } from "../data/seoPages";

function SeoHub() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-black text-[#0B3C6D]">
          Interview Questions and Mock Interview Guides
        </h1>
        <p className="text-slate-600 mt-3 max-w-3xl">
          Explore focused interview preparation pages by role, skill, and experience level. Each page includes practical question patterns,
          answer framing ideas, and mock interview checkpoints.
        </p>

        <section className="mt-8 grid md:grid-cols-2 gap-4">
          {seoPages.map((page) => (
            <Link
              key={page.slug}
              to={`/resources/interview-questions/${page.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow"
            >
              <p className="text-xs uppercase tracking-widest text-[#1E88E5] font-semibold">{page.level}</p>
              <h2 className="mt-2 text-lg font-bold text-[#0B3C6D]">{page.h1}</h2>
              <p className="mt-2 text-sm text-slate-600">{page.metaDescription}</p>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default SeoHub;
