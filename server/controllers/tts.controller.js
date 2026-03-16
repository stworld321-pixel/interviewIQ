import axios from "axios";

const getAudioFromMurf = async ({ text, voiceId, style, rate, pitch }) => {
  const apiKey = process.env.MURF_API_KEY;
  if (!apiKey) {
    throw new Error("Murf API key is missing");
  }

  const endpoint = process.env.MURF_TTS_URL || "https://api.murf.ai/v1/speech/generate";

  const payload = {
    text,
    voiceId,
    style: style || "Conversational",
    format: "MP3",
  };

  if (typeof rate === "number") payload.rate = rate;
  if (typeof pitch === "number") payload.pitch = pitch;

  const response = await axios.post(endpoint, payload, {
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
    timeout: 30000,
  });

  const data = response.data || {};
  const audioUrl =
    data.audioFile ||
    data.audioUrl ||
    data.url ||
    data.fileUrl ||
    data.outputAudioUrl ||
    null;
  const audioBase64 =
    data.audioContent ||
    data.base64Audio ||
    data.audioBase64 ||
    null;

  if (!audioUrl && !audioBase64) {
    throw new Error("Murf did not return playable audio");
  }

  return { audioUrl, audioBase64 };
};

export const speakText = async (req, res) => {
  try {
    const { text, voiceId, style, rate, pitch } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ message: "Text is required for speech generation" });
    }
    if (!voiceId || typeof voiceId !== "string") {
      return res.status(400).json({ message: "voiceId is required for Murf voice generation" });
    }

    const output = await getAudioFromMurf({
      text: text.trim(),
      voiceId: voiceId.trim(),
      style,
      rate: Number.isFinite(Number(rate)) ? Number(rate) : undefined,
      pitch: Number.isFinite(Number(pitch)) ? Number(pitch) : undefined,
    });

    return res.status(200).json({ success: true, ...output });
  } catch (error) {
    const status = error?.response?.status;
    const apiMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data?.detail ||
      null;

    if (status) {
      return res.status(status).json({ message: apiMessage || "Murf TTS request failed" });
    }

    return res.status(500).json({ message: error?.message || "Failed to generate speech" });
  }
};

