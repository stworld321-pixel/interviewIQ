import axios from "axios"

const normalizeAiText = (content) => {
  if (typeof content !== "string") return "";

  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  return trimmed;
};

export const askAi = async (messages) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array is empty.");
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
    const baseUrl = (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
    const timeout = Number(process.env.OPENROUTER_TIMEOUT_MS || 120000);
    const siteUrl = process.env.OPENROUTER_SITE_URL || process.env.CLIENT_URL?.split(",")[0]?.trim() || "";
    const siteName = process.env.OPENROUTER_SITE_NAME || "interviewIQ";

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured.");
    }

    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        messages,
        temperature: 0.4,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...(siteUrl ? { "HTTP-Referer": siteUrl } : {}),
          ...(siteName ? { "X-OpenRouter-Title": siteName } : {}),
        },
        timeout,
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content || !content.trim()) {
      throw new Error("AI returned empty response.");
    }

    return normalizeAiText(content);
  } catch (error) {
    const apiMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error.message;
    console.error("OpenRouter Error:", apiMessage);
    throw new Error(`OpenRouter API Error: ${apiMessage}`);
  }
}
