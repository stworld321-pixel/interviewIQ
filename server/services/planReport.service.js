import { askAi } from "./openRouter.service.js";

const roleKeywordBank = {
  frontend: ["react", "javascript", "typescript", "state management", "performance", "accessibility"],
  backend: ["node.js", "api design", "database", "scalability", "authentication", "security"],
  fullstack: ["react", "node.js", "api integration", "database", "deployment", "testing"],
  data: ["python", "sql", "statistics", "machine learning", "data cleaning", "visualization"],
  devops: ["ci/cd", "docker", "kubernetes", "monitoring", "cloud", "infrastructure"],
};

const getRoleKeywords = (role = "") => {
  const normalized = role.toLowerCase();
  const matchedKey = Object.keys(roleKeywordBank).find((key) => normalized.includes(key));
  return matchedKey ? roleKeywordBank[matchedKey] : ["problem solving", "communication", "role relevance", "clarity"];
};

const parseAiJson = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

const validateTierShape = (planType, parsed) => {
  if (!parsed || typeof parsed !== "object") return false;
  if (planType === "free") {
    return parsed.final_score !== undefined && Array.isArray(parsed.question_feedback);
  }
  if (planType === "starter") {
    return parsed.overall_score !== undefined && parsed.skill_breakdown && Array.isArray(parsed.question_analysis);
  }
  return (
    parsed.interview_readiness_score !== undefined &&
    parsed.advanced_skill_metrics &&
    parsed.speech_analysis &&
    Array.isArray(parsed.personalized_7_day_plan)
  );
};

const buildTranscript = (questions = []) =>
  questions
    .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer || "No answer provided."}`)
    .join("\n\n");

export const generatePlanReport = async ({
  planType = "free",
  role,
  experience,
  mode,
  questions,
  historicalScores = [],
}) => {
  const transcript = buildTranscript(questions);
  const keywordList = getRoleKeywords(role);

  const benchmarkData = {
    role,
    experience,
    mode,
    expectedScoreRange: mode === "Technical" ? "7.5 - 9.2" : "7.0 - 8.8",
    keySignals: keywordList,
  };

  const speechMetrics = {
    speaking_speed_wpm: "Not Available",
    filler_word_count: "Not Available",
    pause_data: "Not Available",
  };

  let systemPrompt = "";
  let userPrompt = "";

  if (planType === "free") {
    systemPrompt = `You are an AI interview evaluator.
Evaluate the candidate in a simple and concise way.
Do NOT provide deep analytics.
Limit output to basic scoring and short feedback only.
Return strict JSON only.`;

    userPrompt = `Role: ${role}
Experience Level: ${experience}
Interview Transcript:
${transcript}

OUTPUT JSON:
{
  "final_score": number,
  "confidence_score": number,
  "communication_score": number,
  "correctness_score": number,
  "professional_advice": "string",
  "question_feedback": [{"question":"string","score":number,"short_feedback":"string"}]
}
Rules:
- Keep question feedback max 2 lines
- Do not include model answers
- Do not include roadmap`;
  } else if (planType === "starter") {
    systemPrompt = `You are an advanced AI interview analyst.
Provide structured evaluation with skill breakdown and improvement suggestions.
Do NOT provide hiring probability or deep behavioral analytics.
Return strict JSON only.`;

    userPrompt = `Role: ${role}
Experience Level: ${experience}
Expected Role Keywords: ${keywordList.join(", ")}
Transcript:
${transcript}

OUTPUT JSON:
{
  "overall_score": number,
  "skill_breakdown": {
    "content_depth": number,
    "logical_flow": number,
    "vocabulary_strength": number,
    "confidence_level": number,
    "role_relevance": number
  },
  "keyword_analysis": {
    "missing_keywords": ["string"],
    "used_keywords": ["string"],
    "overused_phrases": ["string"]
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvement_suggestions": ["string"],
  "question_analysis": [{"question":"string","score":number,"strength":"string","weakness":"string","improvement_tip":"string"}]
}
Rules:
- No model answers
- No hiring probability
- No industry benchmark simulation`;
  } else {
    systemPrompt = `You are an expert AI interview coach and hiring consultant.
Provide deep professional evaluation using hiring standards.
Include readiness level, hiring probability estimate, behavioral analysis, and improvement roadmap.
Return strict JSON only.`;

    userPrompt = `Role: ${role}
Experience Level: ${experience}
Industry Benchmark Data: ${JSON.stringify(benchmarkData)}
Historical Scores: ${JSON.stringify(historicalScores)}
Transcript: ${transcript}
Speech Metrics:
- Speaking Speed: ${speechMetrics.speaking_speed_wpm}
- Filler Word Count: ${speechMetrics.filler_word_count}
- Pause Duration: ${speechMetrics.pause_data}

OUTPUT JSON:
{
  "interview_readiness_score": number,
  "readiness_level": "string",
  "estimated_hiring_probability": "string",
  "advanced_skill_metrics": {
    "logical_structure_index": number,
    "technical_depth_score": number,
    "confidence_stability_index": number,
    "vocabulary_index": number,
    "clarity_index": number
  },
  "speech_analysis": {
    "filler_word_frequency": "string",
    "confidence_drop_points": "string",
    "pace_analysis": "string"
  },
  "industry_comparison": {
    "candidate_vs_average": "string",
    "stronger_areas": ["string"],
    "weaker_areas": ["string"]
  },
  "model_answer_improvements": [{"question":"string","improved_sample_answer":"string"}],
  "personalized_7_day_plan": ["string"],
  "risk_flags": ["string"]
}
Rules:
- Data-driven and specific
- No generic filler`;
  }

  const rawOutput = await askAi([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  const parsed = parseAiJson(rawOutput);
  if (!validateTierShape(planType, parsed)) {
    throw new Error(`Invalid ${planType} report JSON schema from AI`);
  }

  return { rawOutput, parsed, transcript };
};

export const sanitizeTieredReport = (planType = "free", reportData = {}) => {
  if (!reportData || typeof reportData !== "object") return {};

  if (planType === "free") {
    return {
      final_score: reportData.final_score ?? null,
      confidence_score: reportData.confidence_score ?? null,
      communication_score: reportData.communication_score ?? null,
      correctness_score: reportData.correctness_score ?? null,
      professional_advice: reportData.professional_advice ?? "",
      question_feedback: Array.isArray(reportData.question_feedback) ? reportData.question_feedback : [],
    };
  }

  if (planType === "starter") {
    return {
      overall_score: reportData.overall_score ?? null,
      skill_breakdown: reportData.skill_breakdown ?? {},
      keyword_analysis: reportData.keyword_analysis ?? {},
      strengths: Array.isArray(reportData.strengths) ? reportData.strengths : [],
      weaknesses: Array.isArray(reportData.weaknesses) ? reportData.weaknesses : [],
      improvement_suggestions: Array.isArray(reportData.improvement_suggestions) ? reportData.improvement_suggestions : [],
      question_analysis: Array.isArray(reportData.question_analysis) ? reportData.question_analysis : [],
    };
  }

  return {
    interview_readiness_score: reportData.interview_readiness_score ?? null,
    readiness_level: reportData.readiness_level ?? "",
    estimated_hiring_probability: reportData.estimated_hiring_probability ?? "",
    advanced_skill_metrics: reportData.advanced_skill_metrics ?? {},
    speech_analysis: reportData.speech_analysis ?? {},
    industry_comparison: reportData.industry_comparison ?? {},
    model_answer_improvements: Array.isArray(reportData.model_answer_improvements) ? reportData.model_answer_improvements : [],
    personalized_7_day_plan: Array.isArray(reportData.personalized_7_day_plan) ? reportData.personalized_7_day_plan : [],
    risk_flags: Array.isArray(reportData.risk_flags) ? reportData.risk_flags : [],
  };
};
