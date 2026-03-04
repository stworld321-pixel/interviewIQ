import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { BsGraphUpArrow, BsLockFill, BsStars } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const clamp10 = (v) => Math.max(0, Math.min(10, Number(v || 0)));

const drawTrendChartInPdf = (doc, data, x, y, width, height) => {
  if (!data.length) return;

  const xStep = data.length > 1 ? width / (data.length - 1) : width;
  doc.setDrawColor(220);
  doc.rect(x, y, width, height);

  [0, 5, 10].forEach((tick) => {
    const py = y + height - (tick / 10) * height;
    doc.setDrawColor(235);
    doc.line(x, py, x + width, py);
    doc.setTextColor(120);
    doc.setFontSize(8);
    doc.text(String(tick), x - 4, py + 1.5);
  });

  doc.setDrawColor(30, 136, 229);
  doc.setLineWidth(0.8);
  for (let i = 0; i < data.length - 1; i += 1) {
    const x1 = x + i * xStep;
    const y1 = y + height - (data[i].score / 10) * height;
    const x2 = x + (i + 1) * xStep;
    const y2 = y + height - (data[i + 1].score / 10) * height;
    doc.line(x1, y1, x2, y2);
  }

  data.forEach((d, i) => {
    const px = x + i * xStep;
    const py = y + height - (d.score / 10) * height;
    doc.setFillColor(11, 60, 109);
    doc.circle(px, py, 1, "F");
    doc.setTextColor(80);
    doc.setFontSize(8);
    doc.text(d.name, px - 2.5, y + height + 5);
  });
};

function Step3Report({ report }) {
  const navigate = useNavigate();

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    );
  }

  const finalScore = clamp10(report.finalScore);
  const confidence = clamp10(report.confidence);
  const communication = clamp10(report.communication);
  const correctness = clamp10(report.correctness);
  const questionWiseScore = Array.isArray(report.questionWiseScore) ? report.questionWiseScore : [];
  const planType = (report.planType || "free").toLowerCase();
  const tieredReport = report.tieredReport || {};

  const questionData = questionWiseScore.map((q, index) => ({
    index: index + 1,
    name: `Q${index + 1}`,
    question: q.question || "Question not available",
    score: clamp10(q.score),
    confidence: clamp10(q.confidence),
    communication: clamp10(q.communication),
    correctness: clamp10(q.correctness),
    feedback: q.feedback || "No feedback available.",
  }));

  const percentage = (finalScore / 10) * 100;
  const skillBars = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let readinessText = "Needs Focused Practice";
  if (finalScore >= 8.5) readinessText = "Interview Ready";
  else if (finalScore >= 7) readinessText = "Almost Ready";
  else if (finalScore >= 5.5) readinessText = "Building Momentum";

  const freeQuestionFeedback = Array.isArray(tieredReport.question_feedback) ? tieredReport.question_feedback : [];
  const starterStrengths = Array.isArray(tieredReport.strengths) ? tieredReport.strengths : [];
  const starterWeaknesses = Array.isArray(tieredReport.weaknesses) ? tieredReport.weaknesses : [];
  const starterSuggestions = Array.isArray(tieredReport.improvement_suggestions) ? tieredReport.improvement_suggestions : [];
  const starterKeywords = tieredReport.keyword_analysis || {};
  const starterUsedKeywords = Array.isArray(starterKeywords.used_keywords) ? starterKeywords.used_keywords : [];
  const starterMissingKeywords = Array.isArray(starterKeywords.missing_keywords) ? starterKeywords.missing_keywords : [];
  const proRoadmap = Array.isArray(tieredReport.personalized_7_day_plan) ? tieredReport.personalized_7_day_plan : [];
  const modelAnswers = Array.isArray(tieredReport.model_answer_improvements) ? tieredReport.model_answer_improvements : [];
  const proAdvancedMetrics = tieredReport.advanced_skill_metrics || {};
  const proRiskFlags = Array.isArray(tieredReport.risk_flags) ? tieredReport.risk_flags : [];

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(11, 60, 109);
    doc.text("Hireloop Interview Report", pageWidth / 2, currentY, { align: "center" });
    currentY += 7;
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text(`Plan Tier: ${planType.toUpperCase()}`, pageWidth / 2, currentY, { align: "center" });
    currentY += 7;
    doc.setDrawColor(30, 136, 229);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    doc.setFillColor(238, 245, 255);
    doc.roundedRect(margin, currentY, contentWidth, 22, 3, 3, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Overall Score: ${finalScore.toFixed(1)}/10`, margin + 6, currentY + 8);
    doc.text(`Readiness: ${readinessText}`, margin + 6, currentY + 16);
    currentY += 30;

    doc.setFont("helvetica", "bold");
    doc.text("Score Trend Chart", margin, currentY);
    currentY += 4;
    drawTrendChartInPdf(doc, questionData, margin + 8, currentY, contentWidth - 16, 38);
    currentY += 48;

    if (planType === "starter" || planType === "pro") {
      doc.setFont("helvetica", "bold");
      doc.text("Diagnostic Insights", margin, currentY);
      currentY += 6;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(
        `Strengths: ${(starterStrengths.slice(0, 3).join(", ") || "N/A")}\nWeaknesses: ${(starterWeaknesses.slice(0, 3).join(", ") || "N/A")}`,
        contentWidth
      );
      doc.text(lines, margin, currentY);
      currentY += lines.length * 5 + 4;
    }

    if (planType === "pro" && proRoadmap.length) {
      doc.setFont("helvetica", "bold");
      doc.text("7-Day Coaching Plan", margin, currentY);
      currentY += 6;
      doc.setFont("helvetica", "normal");
      proRoadmap.slice(0, 7).forEach((item, idx) => {
        const l = doc.splitTextToSize(`Day ${idx + 1}: ${item}`, contentWidth);
        doc.text(l, margin, currentY);
        currentY += l.length * 5;
      });
      currentY += 4;
    }

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Question", "Score", "Feedback"]],
      body: questionData.map((q) => [`${q.index}`, q.question, `${q.score.toFixed(1)}`, q.feedback]),
      styles: { fontSize: 8.5, cellPadding: 3.5, valign: "top" },
      headStyles: { fillColor: [11, 60, 109], textColor: 255, halign: "center" },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    doc.save(`Hireloop_${planType.toUpperCase()}_Interview_Report.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f8ff] to-[#eaf2fb] px-4 sm:px-6 lg:px-10 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full flex items-start gap-4 flex-wrap">
          <button onClick={() => navigate("/history")} className="mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition">
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Interview Analytics Dashboard</h1>
            <p className="text-gray-500 mt-2">Tier: {planType.toUpperCase()} · AI-powered performance intelligence</p>
          </div>
        </div>
        <button onClick={downloadPDF} className="bg-[#0B3C6D] hover:bg-[#1E88E5] text-white px-6 py-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base">
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-lg p-7 text-center">
            <h3 className="text-gray-500 mb-5 text-sm">Overall Performance</h3>
            <div className="relative w-24 h-24 mx-auto">
              <CircularProgressbar
                value={percentage}
                text={`${finalScore.toFixed(1)}/10`}
                styles={buildStyles({
                  textSize: "16px",
                  pathColor: "#1E88E5",
                  textColor: "#0B3C6D",
                  trailColor: "#e5e7eb",
                })}
              />
            </div>
            <p className="mt-4 font-bold text-lg text-[#0B3C6D]">{readinessText}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-base font-semibold text-gray-700 mb-5">Skill Evaluation</h3>
            <div className="space-y-4">
              {skillBars.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-2 text-sm">
                    <span>{s.label}</span>
                    <span className="font-semibold text-[#0B3C6D]">{s.value.toFixed(1)}</span>
                  </div>
                  <div className="bg-gray-200 h-2.5 rounded-full">
                    <div className="bg-[#1E88E5] h-full rounded-full" style={{ width: `${s.value * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BsGraphUpArrow className="text-[#1E88E5]" />
              <h3 className="text-lg font-semibold text-gray-700">Performance Trend</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#1E88E5" fill="#bfdbfe" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {planType === "free" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-lg p-6 border border-dashed border-slate-300">
              <div className="flex items-center gap-2 mb-3">
                <BsLockFill className="text-[#0B3C6D]" />
                <h3 className="text-lg font-semibold text-gray-700">Advanced Sections Locked</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Upgrade to Starter or Pro to unlock diagnostic insights, keyword gaps, coaching roadmap and model answers.
              </p>
              {freeQuestionFeedback.length > 0 && (
                <div className="space-y-2">
                  {freeQuestionFeedback.slice(0, 3).map((qf, idx) => (
                    <div key={idx} className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      <p className="font-semibold text-slate-700">{qf.question}</p>
                      <p className="text-slate-600">{qf.short_feedback}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {(planType === "starter" || planType === "pro") && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <BsStars className="text-[#1E88E5]" />
                <h3 className="text-lg font-semibold text-gray-700">Diagnostic Insights</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs text-slate-500 mb-2">Strengths</p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    {(starterStrengths.length ? starterStrengths : ["Consistent response clarity"]).slice(0, 3).map((item, idx) => (
                      <li key={idx}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs text-slate-500 mb-2">Weaknesses</p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    {(starterWeaknesses.length ? starterWeaknesses : ["Improve answer depth"]).slice(0, 3).map((item, idx) => (
                      <li key={idx}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs text-slate-500 mb-2">Suggestions</p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    {(starterSuggestions.length ? starterSuggestions : ["Use STAR structure"]).slice(0, 3).map((item, idx) => (
                      <li key={idx}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {(starterUsedKeywords.length > 0 || starterMissingKeywords.length > 0) && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                    <p className="text-xs text-slate-500 mb-2">Used Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {starterUsedKeywords.slice(0, 8).map((k, idx) => (
                        <span key={idx} className="text-xs bg-[#eaf2fb] text-[#0B3C6D] px-2 py-1 rounded-full">{k}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                    <p className="text-xs text-slate-500 mb-2">Missing Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {starterMissingKeywords.slice(0, 8).map((k, idx) => (
                        <span key={idx} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {planType === "pro" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Pro Coaching Engine</h3>
              <p className="text-sm text-slate-600 mb-3">
                Readiness Level: <span className="font-semibold text-[#0B3C6D]">{tieredReport.readiness_level || "In Progress"}</span>
                {" "}· Hiring Probability: <span className="font-semibold text-[#0B3C6D]">{tieredReport.estimated_hiring_probability || "N/A"}</span>
              </p>
              <div className="space-y-2">
                {(proRoadmap.length ? proRoadmap : ["Daily speaking drill", "Refine weak answers", "Role-specific mock drill"])
                  .slice(0, 7)
                  .map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-slate-50">
                      Day {idx + 1}: {item}
                    </div>
                  ))}
              </div>

              {modelAnswers.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[#0B3C6D] mb-2">Model Answer Improvements</p>
                  <div className="space-y-2">
                    {modelAnswers.slice(0, 2).map((m, idx) => (
                      <div key={idx} className="text-sm border border-slate-200 rounded-xl p-3 bg-white">
                        <p className="font-semibold text-slate-700">{m.question}</p>
                        <p className="text-slate-600 mt-1">{m.improved_sample_answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {Object.keys(proAdvancedMetrics).length > 0 && (
                <div className="mt-4 rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-sm font-semibold text-[#0B3C6D] mb-2">Advanced Skill Metrics</p>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {Object.entries(proAdvancedMetrics).map(([key, value]) => (
                      <div key={key} className="bg-white border border-slate-200 rounded-lg px-3 py-2">
                        {key.replaceAll("_", " ")}: <span className="font-semibold">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {proRiskFlags.length > 0 && (
                <div className="mt-4 rounded-xl border border-red-200 p-4 bg-red-50">
                  <p className="text-sm font-semibold text-red-700 mb-2">Risk Flags</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    {proRiskFlags.map((flag, idx) => (
                      <li key={idx}>- {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-5">Question Breakdown</h3>
            <div className="space-y-5">
              {questionData.map((q) => (
                <div key={q.index} className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Question {q.index}</p>
                      <p className="font-semibold text-gray-800 text-sm leading-relaxed">{q.question}</p>
                    </div>
                    <div className="bg-[#eaf2fb] text-[#0B3C6D] px-3 py-1 rounded-full font-bold text-xs w-fit">
                      {q.score.toFixed(1)}/10
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2 mb-3">
                    <div className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2">
                      Confidence: <span className="font-semibold">{q.confidence.toFixed(1)}</span>
                    </div>
                    <div className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2">
                      Communication: <span className="font-semibold">{q.communication.toFixed(1)}</span>
                    </div>
                    <div className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2">
                      Correctness: <span className="font-semibold">{q.correctness.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="bg-[#eef5ff] border border-[#cfe0f7] p-3 rounded-lg">
                    <p className="text-xs text-[#0B3C6D] font-semibold mb-1">AI Feedback</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{q.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Step3Report;
