import React from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer'
import { motion } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import axios from "axios"
import { ServerUrl } from '../App'
import { BsArrowRight, BsVolumeUp } from 'react-icons/bs'

const murfVoiceOptions = [
  { provider: "murf", id: "en-US-natalie", label: "Murf Natalie (Warm Female)", gender: "female", style: "Conversational" },
  { provider: "murf", id: "en-US-miles", label: "Murf Miles (Calm Male)", gender: "male", style: "Conversational" },
  { provider: "murf", id: "en-US-aria", label: "Murf Aria (Professional Female)", gender: "female", style: "Narration" },
  { provider: "murf", id: "en-US-jackson", label: "Murf Jackson (Assertive Male)", gender: "male", style: "Narration" },
];

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLimit || 60
  );
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const [submitError, setSubmitError] = useState("");


  const videoRef = useRef(null);
  const murfAudioRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const lastSpokenKeyRef = useRef("");

  const currentQuestion = questions[currentIndex];
  const selectedVoice = availableVoices.find((voice) => voice.key === selectedVoiceId) || null;


  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const browserVoices = voices.map((voice, index) => {
        const lowerName = voice.name.toLowerCase();
        const gender = lowerName.includes("david") || lowerName.includes("male") ? "male" : "female";
        return {
          provider: "browser",
          key: `browser-${index}`,
          id: voice.name,
          label: `${voice.name} (Browser)`,
          gender,
          voiceObj: voice,
        };
      });
      const murfVoices = murfVoiceOptions.map((voice) => ({
        ...voice,
        key: `murf-${voice.id}`,
      }));
      const mergedVoices = [...murfVoices, ...browserVoices];
      setAvailableVoices(mergedVoices);

      setSelectedVoiceId((prev) => prev || mergedVoices[0]?.key || "");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [])

  useEffect(() => {
    if (selectedVoice?.gender) {
      setVoiceGender(selectedVoice.gender);
    }
  }, [selectedVoice]);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;


  /* ---------------- SPEAK FUNCTION ---------------- */
  const playMurfAudio = async (text, voiceConfig) => {
    const token = localStorage.getItem("token");
    const result = await axios.post(
      ServerUrl + "/api/tts/speak",
      {
        text,
        voiceId: voiceConfig.id,
        style: voiceConfig.style || "Conversational",
      },
      {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 35000,
      }
    );

    const audioUrl = result?.data?.audioUrl;
    const audioBase64 = result?.data?.audioBase64;
    const src = audioUrl || (audioBase64 ? `data:audio/mpeg;base64,${audioBase64}` : null);
    if (!src) throw new Error("No playable audio from Murf");

    return new Promise((resolve, reject) => {
      const audio = new Audio(src);
      murfAudioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
      audio.play().catch(reject);
    });
  };

  const speakWithBrowser = (text, browserVoice) =>
    new Promise((resolve) => {
      if (!window.speechSynthesis || !browserVoice?.voiceObj) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = browserVoice.voiceObj;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });

  const speakText = async (text) => {
    if (isSpeakingRef.current) return;
    if (!selectedVoice) return;
    isSpeakingRef.current = true;
    if (murfAudioRef.current) {
      murfAudioRef.current.pause();
      murfAudioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsAIPlaying(true);
    stopMic();
    setSubtitle(text);
    videoRef.current?.play();

    try {
      if (selectedVoice.provider === "murf") {
        await playMurfAudio(text, selectedVoice);
      } else {
        await speakWithBrowser(text, selectedVoice);
      }
    } catch (error) {
      const fallbackVoice = availableVoices.find((voice) => voice.provider === "browser");
      if (fallbackVoice) {
        await speakWithBrowser(text, fallbackVoice);
      } else {
        console.log(error);
      }
    } finally {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
      setIsAIPlaying(false);
      setSubtitle("");
      isSpeakingRef.current = false;
      if (isMicOn) startMic();
    }
  };


  useEffect(() => {
    if (!selectedVoice) {
      return;
    }
    const runIntro = async () => {
      if (isIntroPhase) {
        const introKey = `intro-${selectedVoiceId}`;
        if (lastSpokenKeyRef.current === introKey) return;
        lastSpokenKeyRef.current = introKey;

        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        setIsIntroPhase(false)
      } else if (currentQuestion) {
        const questionKey = `question-${currentIndex}-${selectedVoiceId}`;
        if (lastSpokenKeyRef.current === questionKey) return;
        lastSpokenKeyRef.current = questionKey;

        await new Promise(r => setTimeout(r, 800));

        // If last question (hard level)
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);
      }

    }

    runIntro()
  }, [selectedVoiceId, isIntroPhase, currentIndex, currentQuestion, userName])



  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0;
        }
        return prev - 1

      })
    }, 1000);

    return () => clearInterval(timer)

  }, [isIntroPhase, currentIndex])

  useEffect(() => {
  if (!isIntroPhase && currentQuestion) {
    setTimeLeft(currentQuestion.timeLimit || 60);
  }
}, [currentIndex]);


  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;

  }, []);


  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch { }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };


  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic()
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken:
          currentQuestion.timeLimit - timeLeft,
      } , {withCredentials:true, timeout: 30000})

      const serverFeedback = result?.data?.feedback || "Answer submitted successfully.";
      setFeedback(serverFeedback)
      speakText(serverFeedback)
    } catch (error) {
      console.log(error)
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        (status === 401 ? "Session expired. Please login again." : "") ||
        (error?.code === "ECONNABORTED" ? "Request timed out. Please retry." : "") ||
        "Unable to submit answer. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext =async () => {
    setAnswer("");
    setFeedback("");
    setSubmitError("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);

   
  }

  const finishInterview = async () => {
    stopMic()
    setIsMicOn(false)
    try {
      const result = await axios.post(ServerUrl+ "/api/interview/finish" , { interviewId} , {withCredentials:true})

      console.log(result.data)
      onFinish(result.data)
    } catch (error) {
      console.log(error)
    }
  }


   useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer()
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }

      window.speechSynthesis.cancel();
      if (murfAudioRef.current) {
        murfAudioRef.current.pause();
        murfAudioRef.current = null;
      }
    };
  }, []);







  return (
    <div className='min-h-screen bg-linear-to-br from-[#eef5ff] via-white to-[#eaf2fb] flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>

        {/* video section */}
        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
          <div className='w-full max-w-md rounded-2xl border border-[#d7e7fc] bg-gradient-to-r from-[#eef5ff] to-white p-4 shadow-sm'>
            <div className='flex items-center justify-between mb-3'>
              <label className='text-xs font-bold text-[#0B3C6D] uppercase tracking-wider flex items-center gap-2'>
                <BsVolumeUp className='text-[#1E88E5]' />
                Voice Design
              </label>
              <span className='text-[10px] px-2 py-1 rounded-full bg-[#0B3C6D] text-white uppercase tracking-wider'>
                {selectedVoice?.provider === "murf" ? "Murf Realistic" : "Browser"}
              </span>
            </div>
            <select
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className='w-full bg-white border border-[#bdd6f7] rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#1E88E5]/40'
            >
              {availableVoices.map((voice) => (
                <option key={voice.key} value={voice.key}>
                  {voice.label}
                </option>
              ))}
            </select>
            <p className='mt-2 text-xs text-[#52749c]'>
              Select a voice before interview starts. Murf gives emotional realistic output.
            </p>
          </div>

          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* subtitle */}
          {subtitle && (
            <div className='w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
          )}


          {/* timer Area */}
          <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>
                Interview Status
              </span>
              {isAIPlaying && <span className='text-sm font-semibold text-[#0B3C6D]'>
                {isAIPlaying ? "AI Speaking" : ""}
              </span>}
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className='flex justify-center'>

              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className='grid grid-cols-2 gap-6 text-center'>
              <div>
                <span className='text-2xl font-bold text-[#0B3C6D]'>{currentIndex + 1}</span>
                <span className='text-xs text-gray-400'>Current Questions</span>
              </div>

              <div>
                <span className='text-2xl font-bold text-[#0B3C6D]'>{questions.length}</span>
                <span className='text-xs text-gray-400'>Total Questions</span>
              </div>
            </div>


          </div>
        </div>

        {/* Text section */}

        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>
          <h2 className='text-xl sm:text-2xl font-bold text-[#0B3C6D] mb-6'>
            AI Smart Interview
          </h2>


          {!isIntroPhase && (<div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
            <p className='text-xs sm:text-sm text-gray-400 mb-2'>
              Question {currentIndex + 1} of {questions.length}
            </p>

            <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed '>{currentQuestion?.question}</div>
          </div>)
          }
          <textarea
            placeholder="Type your answer here..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-[#1E88E5] transition text-gray-800" />


         {!feedback ? ( <div className='flex items-center gap-4 mt-6'>
            <motion.button
              onClick={toggleMic}
              whileTap={{ scale: 0.9 }}
              className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg'>
              {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20}/>}
            </motion.button>

            <motion.button
            onClick={submitAnswer}
            disabled={isSubmitting}
              whileTap={{ scale: 0.95 }}
              className='flex-1 bg-gradient-to-r from-[#0B3C6D] to-[#1E88E5] text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500'>
              {isSubmitting?"Submitting...":"Submit Answer"}

            </motion.button>

          </div>):(
            <motion.div 
             initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            className='mt-6 bg-[#eef5ff] border border-[#cfe0f7] p-5 rounded-2xl shadow-sm'>
              <p className='text-[#0B3C6D] font-medium mb-4'>{feedback}</p>

              <button
              onClick={handleNext}

               className='w-full bg-gradient-to-r from-[#0B3C6D] to-[#1E88E5] text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1'>
                Next Question <BsArrowRight size={18}/>
              </button>

            </motion.div>
          )}
          {submitError && !feedback && (
            <p className='mt-3 text-sm text-red-600 font-medium'>{submitError}</p>
          )}
        </div>
      </div>

    </div>
  )
}

export default Step2Interview

