import axios from "axios"

export const askAi = async (messages) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array is empty.");
    }

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
    const ollamaModel = process.env.OLLAMA_MODEL || "llama3.1:8b";
    const ollamaTimeout = Number(process.env.OLLAMA_TIMEOUT_MS || 120000);

    const response = await axios.post(
      `${ollamaBaseUrl.replace(/\/+$/, "")}/api/chat`,
      {
        model: ollamaModel,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: ollamaTimeout,
      }
    );

    const content = response?.data?.message?.content;
    if (!content || !content.trim()) {
      throw new Error("AI returned empty response.");
    }

    return content;
  } catch (error) {
    const apiMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error.message;
    console.error("Ollama Error:", apiMessage);
    throw new Error(`Ollama API Error: ${apiMessage}`);
  }
}
