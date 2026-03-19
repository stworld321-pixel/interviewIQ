import React, { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { seoPageMap } from "../data/seoPages";
import mmImage from "../assets/MM.png";
import signupImage from "../assets/Signup.png";
import hrImage from "../assets/HR.png";
import historyImage from "../assets/history.png";
import creditImage from "../assets/credit.png";
import confidenceImage from "../assets/confi.png";
import aiAnswerImage from "../assets/ai-ans.png";
import pdfImage from "../assets/pdf.png";
import resumeImage from "../assets/resume.png";
import techImage from "../assets/tech.png";
import image1 from "../assets/img1.png";

function SeoPage() {
  const { slug } = useParams();
  const page = seoPageMap[slug || ""];

  const keyword = page?.keyword || page?.h1 || "AI mock interview";

  const screenshotPool = useMemo(
    () => [
      mmImage,
      signupImage,
      hrImage,
      historyImage,
      creditImage,
      confidenceImage,
      aiAnswerImage,
      pdfImage,
      resumeImage,
      techImage,
      image1,
    ],
    []
  );

  const screenshotPair = useMemo(() => {
    if (!page) return [mmImage, signupImage];
    const hash = (page.slug || "")
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const first = screenshotPool[hash % screenshotPool.length];
    const second = screenshotPool[(hash + 3) % screenshotPool.length];
    return [first, second];
  }, [page, screenshotPool]);

  const questionSet = useMemo(() => {
    if (!page) return [];
    return [
      `Tell me about your experience related to ${page.role}.`,
      `How would you handle a high-pressure task as a ${page.role}?`,
      `Explain a project where you improved outcomes in ${page.focus[0]}.`,
      `How do you prioritize work when deadlines overlap?`,
      `What are common mistakes candidates make in ${page.role} interviews?`,
      `How do you measure success in your day-to-day responsibilities?`,
      `Which tools or frameworks are most important for this role and why?`,
      `How would your manager describe your communication style?`,
      `Describe a difficult stakeholder situation and how you resolved it.`,
      `If you had 30 days to improve results, what would your plan look like?`,
    ];
  }, [page]);

  const faqItems = useMemo(() => {
    if (!page) return [];
    return [
      {
        q: `How do I prepare for ${page.h1.toLowerCase()} quickly?`,
        a: `Start with a focused 7-day plan: revise role fundamentals, practice structured answers, and run at least two timed mock interviews. Track weak areas and improve one skill block per day.`
      },
      {
        q: `How many questions should I practice for ${page.role} interviews?`,
        a: `Aim for 30 to 50 high-quality questions, not hundreds of random ones. Prioritize role-relevant scenarios and repeat difficult questions until your delivery is clear and confident.`
      },
      {
        q: `What answer format works best in interview rounds?`,
        a: `Use a concise structure: context, task, action, and measurable result. This makes your answer easy to score on communication, problem solving, and business impact.`
      },
      {
        q: `Can AI mock interviews improve real interview performance?`,
        a: `Yes. AI mock interviews help you practice under pressure, identify weak responses, and iterate faster. You gain consistency in clarity, confidence, and relevance before actual rounds.`
      },
      {
        q: `What should I avoid while answering role-specific interview questions?`,
        a: `Avoid generic theory-only answers, long unrelated stories, and missing outcomes. Interviewers expect role context, clear thought process, and practical decision-making evidence.`
      },
    ];
  }, [page]);

  const schema = useMemo(() => {
    if (!page) return null;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "name": page.title,
          "description": page.metaDescription,
          "url": `https://interview.localjobshub.in/resources/interview-questions/${page.slug}`,
          "inLanguage": "en",
          "dateModified": "2026-03-19"
        },
        {
          "@type": "FAQPage",
          "mainEntity": faqItems.map((item) => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": item.a,
            },
          }))
        }
      ]
    };
  }, [page, faqItems]);

  useEffect(() => {
    if (!page) return;
    document.title = page.title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = page.metaDescription;

    const existingScript = document.getElementById("seo-page-schema");
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.id = "seo-page-schema";
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const cleanupScript = document.getElementById("seo-page-schema");
      if (cleanupScript) cleanupScript.remove();
    };
  }, [page, schema]);

  if (!page) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold text-[#0B3C6D]">Page not found</h1>
          <Link to="/resources/interview-questions" className="inline-block mt-4 text-[#1E88E5] underline">
            Back to resources
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <Link to="/resources/interview-questions" className="text-sm text-[#1E88E5] hover:text-[#0B3C6D]">
          Back to all interview resources
        </Link>

        <section className="mt-4 rounded-3xl bg-gradient-to-br from-[#0B3C6D] to-[#1E88E5] text-white p-8 md:p-10">
          <p className="text-xs uppercase tracking-widest text-white/80 font-semibold">Primary Keyword: {keyword}</p>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mt-3">{page.h1}</h1>
          <p className="mt-4 text-white/90 max-w-3xl">{page.metaDescription}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {page.focus.map((item) => (
              <span key={item} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-8 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-bold text-[#0B3C6D]">Why This Interview Topic Matters</h2>
            <p className="text-slate-700 mt-3 leading-7">
              Candidates searching for <strong>{keyword}</strong> usually want practical preparation that converts into better interview performance,
              not just a random list of generic questions. In real interview rounds, evaluators score clarity, role relevance, communication under
              pressure, and evidence of decision-making. This means your preparation should connect role knowledge with real project outcomes.
              For {page.role} interviews, high-quality practice helps you answer confidently without over-explaining or losing structure.
            </p>
            <p className="text-slate-700 mt-3 leading-7">
              The strongest candidates treat preparation like a sprint with measurable checkpoints. They identify common themes, build short answer
              frameworks, and simulate difficult follow-up questions. If you practice with this method, you can improve not only correctness but also
              delivery speed, confidence, and consistency. This page gives you a structured path so your effort translates into actual selection-ready
              performance.
            </p>

            <div className="mt-7 rounded-2xl border border-[#1E88E5]/30 bg-[#1E88E5]/5 p-5">
              <h3 className="text-lg font-bold text-[#0B3C6D]">Practice This Topic in Live Mode</h3>
              <p className="text-sm text-slate-700 mt-1">
                Run a timed AI mock interview for this exact role and get instant feedback on your answer quality.
              </p>
              <Link
                to="/interview"
                className="inline-flex mt-3 px-4 py-2 rounded-full bg-[#0B3C6D] text-white font-semibold hover:bg-[#1E88E5] transition"
              >
                Start Free Mock Interview
              </Link>
            </div>

            <h2 className="text-2xl font-bold text-[#0B3C6D] mt-10">Preparation Blueprint for {page.level}</h2>
            <p className="text-slate-700 mt-3 leading-7">
              Start with fundamentals first: role expectations, day-to-day responsibilities, and tools used in production. Then map your experience
              to impact stories. For each story, keep four parts ready: business context, challenge, action, and measurable result. This approach makes
              your answer interview-ready and easy for panelists to evaluate. If you are at {page.level.toLowerCase()} level, focus extra on
              communication clarity and logical sequencing, because these are often decisive scoring factors.
            </p>
            <p className="text-slate-700 mt-3 leading-7">
              Next, add deliberate practice loops. Record one mock answer, review it, improve one weak point, and repeat. Common weaknesses are
              excessive filler words, missing business outcomes, and weak transitions between ideas. A disciplined iteration cycle can significantly
              improve interview readiness in just one week. Keep answers concise, use role language, and prioritize relevance over quantity.
            </p>

            <h2 className="text-2xl font-bold text-[#0B3C6D] mt-10">Screenshots and Workflow</h2>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <figure className="rounded-xl border border-slate-200 overflow-hidden">
                <img src={screenshotPair[0]} alt={`${page.h1} mock interview interface screenshot`} className="w-full h-48 object-cover" />
                <figcaption className="p-3 text-xs text-slate-600">Role-specific AI mock interview screen for timed answer practice.</figcaption>
              </figure>
              <figure className="rounded-xl border border-slate-200 overflow-hidden">
                <img src={screenshotPair[1]} alt={`${page.h1} performance report screenshot`} className="w-full h-48 object-cover" />
                <figcaption className="p-3 text-xs text-slate-600">Post-session report view with improvement areas and confidence insights.</figcaption>
              </figure>
            </div>

            <h2 className="text-2xl font-bold text-[#0B3C6D] mt-10">Top Practice Questions</h2>
            <p className="text-slate-700 mt-3 leading-7">
              Use the following set as a high-signal question bank. Don’t just memorize answers. Instead, create concise response frameworks,
              practice follow-up handling, and validate that each answer includes measurable outcomes where possible.
            </p>
            <ol className="list-decimal pl-6 mt-4 space-y-2 text-slate-700">
              {questionSet.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>

            <div className="mt-7 rounded-2xl border border-[#F97316]/40 bg-[#F97316]/5 p-5">
              <h3 className="text-lg font-bold text-[#0B3C6D]">Convert Questions into Real Answers</h3>
              <p className="text-sm text-slate-700 mt-1">
                Start a mock round and practice these exact questions with performance scoring.
              </p>
              <Link
                to="/interview"
                className="inline-flex mt-3 px-4 py-2 rounded-full bg-[#0B3C6D] text-white font-semibold hover:bg-[#1E88E5] transition"
              >
                Practice Questions Now
              </Link>
            </div>

            <h2 className="text-2xl font-bold text-[#0B3C6D] mt-10">Common Mistakes and Better Alternatives</h2>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-700">
              <li>Giving generic answers without role-specific context or decision rationale.</li>
              <li>Explaining activity but skipping outcomes, impact, or measurable success.</li>
              <li>Using long unstructured responses that reduce clarity and confidence.</li>
              <li>Not preparing for probing follow-up questions from interviewers.</li>
              <li>Ignoring communication pacing and rushing through critical points.</li>
            </ul>
            <p className="text-slate-700 mt-3 leading-7">
              Replace weak answers with focused narratives. Interviewers reward candidates who can simplify complexity, make tradeoffs visible,
              and communicate actions with ownership. Every answer should help the panel trust your execution in real workplace scenarios.
            </p>

            <h2 className="text-2xl font-bold text-[#0B3C6D] mt-10">Frequently Asked Questions</h2>
            <div className="mt-4 space-y-3">
              {faqItems.map((item) => (
                <details key={item.q} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <summary className="font-semibold text-[#0B3C6D] cursor-pointer">{item.q}</summary>
                  <p className="text-slate-700 mt-2 text-sm leading-6">{item.a}</p>
                </details>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[#1E88E5]/30 bg-[#0B3C6D] p-6 text-white">
              <h3 className="text-xl font-bold">Attend a Full Mock Interview</h3>
              <p className="text-white/90 mt-1 text-sm">
                Build confidence with role-specific AI interview simulation and instant actionable feedback.
              </p>
              <Link
                to="/interview"
                className="inline-flex mt-3 px-4 py-2 rounded-full bg-white text-[#0B3C6D] font-semibold hover:bg-slate-100 transition"
              >
                Start Free Interview
              </Link>
            </div>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-bold text-[#0B3C6D]">Page Snapshot</h3>
              <p className="text-sm text-slate-600 mt-2">Keyword: {keyword}</p>
              <p className="text-sm text-slate-600">Role: {page.role}</p>
              <p className="text-sm text-slate-600">Experience: {page.level}</p>
              <Link
                to="/interview"
                className="inline-flex mt-4 px-4 py-2 rounded-full bg-[#0B3C6D] text-white font-semibold hover:bg-[#1E88E5] transition"
              >
                Start Free Mock Interview
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-bold text-[#0B3C6D]">Focus Areas</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {page.focus.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default SeoPage;
