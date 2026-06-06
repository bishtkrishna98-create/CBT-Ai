import { useState, useEffect } from "react";
import { DistortionType, DISTORTION_INFOS, ReframedThought } from "../types";
import { AlertCircle, HelpCircle, Check, Sparkles, Star, ShieldCheck, Heart, Layout, Save, Info, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface ThoughtChallengerProps {
  initialThoughtText?: string;
  initialContext?: "commute" | "work";
  onSave: (thought: ReframedThought) => void;
  onCancel?: () => void;
}

export default function ThoughtChallenger({ initialThoughtText = "", initialContext = "commute", onSave, onCancel }: ThoughtChallengerProps) {
  const [step, setStep] = useState(1);
  const [context, setContext] = useState<"commute" | "work">(initialContext);
  const [situation, setSituation] = useState("");
  const [negativeThought, setNegativeThought] = useState(initialThoughtText);
  const [selectedDistortions, setSelectedDistortions] = useState<DistortionType[]>([]);
  const [evidenceFor, setEvidenceFor] = useState("");
  const [evidenceAgainst, setEvidenceAgainst] = useState("");
  
  // AI Reframing State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    empathy: string;
    deconstruction: string;
    reframes: string[];
    microAction: string;
  } | null>(null);
  
  const [usefulness, setUsefulness] = useState<number>(0);

  useEffect(() => {
    if (initialThoughtText) {
      setNegativeThought(initialThoughtText);
    }
    if (initialContext) {
      setContext(initialContext);
    }
  }, [initialThoughtText, initialContext]);

  const toggleDistortion = (type: DistortionType) => {
    setSelectedDistortions(prev => 
      prev.includes(type) ? prev.filter(d => d !== type) : [...prev, type]
    );
  };

  const handleNextStep = () => {
    if (step === 1 && !situation.trim()) return;
    if (step === 2 && !negativeThought.trim()) return;
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const executeReframeAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation,
          negativeThought,
          distortions: selectedDistortions,
          context
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate CBT reframing statement.");
      }

      setAiResult(data);
      setStep(6); // Go directly to result step
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during reframing.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeSave = () => {
    if (!aiResult) return;
    const reframedItem: ReframedThought = {
      id: "thought_" + Date.now(),
      timestamp: new Date().toISOString(),
      situation,
      context,
      negativeThought,
      distortions: selectedDistortions,
      evidenceFor,
      evidenceAgainst,
      alternativeThought: aiResult.reframes[0] || "I will choose standard balance.",
      aiExplanation: `${aiResult.empathy}\n\n${aiResult.deconstruction}\n\nGrounding task: ${aiResult.microAction}`,
      usefulnessRating: usefulness
    };

    onSave(reframedItem);
    // Reset state
    setStep(1);
    setSituation("");
    setNegativeThought("");
    setSelectedDistortions([]);
    setEvidenceFor("");
    setEvidenceAgainst("");
    setAiResult(null);
    setUsefulness(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6" id="thought-challenger-component">
      {/* Step Indicators */}
      <div className="flex items-center justify-between max-w-lg mx-auto mb-8 overflow-x-auto gap-2 pb-2">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <div key={num} className="flex items-center gap-1 shrink-0">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                step === num
                  ? "bg-neutral-900 text-white"
                  : step > num
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {num}
            </div>
            {num < 6 && (
              <div
                className={`w-4 h-[2px] ${
                  step > num ? "bg-emerald-600" : "bg-neutral-100"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* STEP 1: SITUATION CONTEXT */}
        {step === 1 && (
          <div className="space-y-5" id="tc-step-1">
            <div>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Step 1 of 6</span>
              <h2 className="text-xl font-medium text-neutral-800 leading-tight">Where is this stress occurring?</h2>
              <p className="text-xs text-neutral-500 mt-1">Select the setting to help tailor the AI guidance model.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                id="tc-context-commute"
                onClick={() => setContext("commute")}
                className={`p-4 rounded-2xl border text-left transition ${
                  context === "commute"
                    ? "border-amber-500 bg-amber-50/50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <span className="text-lg block">🚗</span>
                <span className="text-sm font-medium text-neutral-800 block mt-2">Commuting</span>
                <span className="text-xs text-neutral-400 block mt-0.5">En route (trains, buses, driving, crowds)</span>
              </button>

              <button
                id="tc-context-work"
                onClick={() => setContext("work")}
                className={`p-4 rounded-2xl border text-left transition ${
                  context === "work"
                    ? "border-indigo-500 bg-indigo-50/50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <span className="text-lg block">💻</span>
                <span className="text-sm font-medium text-neutral-800 block mt-2">At Work</span>
                <span className="text-xs text-neutral-400 block mt-0.5">Desk stress, briefings, meetings, emails</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
                Briefly describe the physical situation:
              </label>
              <textarea
                id="tc-situation-input"
                rows={4}
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="e.g. My morning bus has been parked in heavy gridlock traffic for 15 minutes, with no updates from driver..."
                className="w-full text-sm p-4 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              {onCancel && (
                <button
                  id="tc-cancel-s1"
                  onClick={onCancel}
                  className="px-4 py-2 text-neutral-500 hover:text-neutral-800 transition text-xs"
                >
                  Cancel
                </button>
              )}
              <div className="ml-auto">
                <button
                  id="tc-next-s1"
                  onClick={handleNextStep}
                  disabled={!situation.trim()}
                  className={`px-5 py-2 rounded-xl text-xs font-medium transition ${
                    situation.trim()
                      ? "bg-neutral-900 text-white hover:bg-neutral-800"
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: WHAT IS YOUR AUTOMATIC NEGATIVE THOUGHT */}
        {step === 2 && (
          <div className="space-y-5" id="tc-step-2">
            <div>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Step 2 of 6</span>
              <h2 className="text-xl font-medium text-neutral-800 leading-tight">What is your automatic negative thought?</h2>
              <p className="text-xs text-neutral-500 mt-1">This is the unfiltered, spontaneous phrase your mind repeating right now.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-600 block uppercase tracking-wider">Automatic Thought:</label>
              <textarea
                id="tc-negative-thought-input"
                rows={4}
                value={negativeThought}
                onChange={(e) => setNegativeThought(e.target.value)}
                placeholder="e.g. If I'm late to the office meeting today, they will all think I am lazy, disorganized, and I might get fired..."
                className="w-full text-sm p-4 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              <p className="text-[11px] text-neutral-400 italic">CBT Tip: Don't edit it. Write down exactly what your inner anxious voice is shouting.</p>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                id="tc-prev-s2"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition text-xs"
              >
                Back
              </button>
              <button
                id="tc-next-s2"
                onClick={handleNextStep}
                disabled={!negativeThought.trim()}
                className={`px-5 py-2 rounded-xl text-xs font-medium transition ${
                  negativeThought.trim()
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                }`}
              >
                Analyze Thought
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SELECT COGNITIVE DISTORTIONS */}
        {step === 3 && (
          <div className="space-y-5" id="tc-step-3">
            <div>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Step 3 of 6</span>
              <h2 className="text-xl font-medium text-neutral-800 leading-tight">Identify any Cognitive Errors (Distortions)</h2>
              <p className="text-xs text-neutral-500 mt-1">Select one or more quick shortcuts your stressful brain might be taking.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
              {Object.values(DISTORTION_INFOS).map((info) => {
                const isSelected = selectedDistortions.includes(info.type);
                return (
                  <button
                    key={info.type}
                    id={`distortion-toggle-${info.type.replace(/\s+/g, '-').toLowerCase()}`}
                    type="button"
                    onClick={() => toggleDistortion(info.type)}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/10 ring-1 ring-emerald-600"
                        : "border-neutral-150 hover:border-neutral-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-xs font-medium text-neutral-800 flex items-center gap-1">
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          {info.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
                        {info.description}
                      </p>
                    </div>
                    <span className="text-[10px] italic text-neutral-400 mt-2 block shrink-0">
                      Ex: {info.example}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                id="tc-prev-s3"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition text-xs"
              >
                Back
              </button>
              <button
                id="tc-next-s3"
                onClick={handleNextStep}
                className="px-5 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition text-xs font-medium"
              >
                Test Evidence
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: EXAMINE THE EVIDENCE */}
        {step === 4 && (
          <div className="space-y-5" id="tc-step-4">
            <div>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Step 4 of 6</span>
              <h2 className="text-xl font-medium text-neutral-800 leading-tight">Examine the Facts (The Trial)</h2>
              <p className="text-xs text-neutral-500 mt-1">Separate opinions from neutral objective evidence. Imagine presenting this to a judge.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Facts supporting this thought:
                </label>
                <textarea
                  id="tc-evidence-for-input"
                  rows={4}
                  value={evidenceFor}
                  onChange={(e) => setEvidenceFor(e.target.value)}
                  placeholder="e.g. I am physically sitting on a stuck bus and will likely walk in 15 minutes past the start time of the briefing..."
                  className="w-full text-xs p-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Facts countering this thought:
                </label>
                <textarea
                  id="tc-evidence-against-input"
                  rows={4}
                  value={evidenceAgainst}
                  onChange={(e) => setEvidenceAgainst(e.target.value)}
                  placeholder="e.g. My boss is generally supportive. I can send a quick delay email. One slight delay has never ruined anyone's career here..."
                  className="w-full text-xs p-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                id="tc-prev-s4"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition text-xs"
              >
                Back
              </button>
              <button
                id="tc-next-s4"
                onClick={handleNextStep}
                className="px-5 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition text-xs font-medium"
              >
                Review Summary & Reframe
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: TRIAL SUMMARY REVIEW */}
        {step === 5 && (
          <div className="space-y-6" id="tc-step-5">
            <div>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Step 5 of 6</span>
              <h2 className="text-xl font-medium text-neutral-800 leading-tight">Ready for AI CBT Reframing?</h2>
              <p className="text-xs text-neutral-500 mt-1">Review your cognitive trial details before our clinical-style AI processes the constructive balanced reframes.</p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-5 space-y-4 text-xs border border-neutral-100">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-neutral-100">
                <div>
                  <span className="font-semibold text-neutral-400 block uppercase tracking-wider text-[9px]">Context</span>
                  <span className="text-neutral-700 capitalize font-medium">{context}</span>
                </div>
                <div>
                  <span className="font-semibold text-neutral-400 block uppercase tracking-wider text-[9px]">Distortions spotted</span>
                  <span className="text-neutral-700 font-medium">{selectedDistortions.length ? selectedDistortions.join(", ") : "None specified"}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-neutral-400 block uppercase tracking-wider text-[9px]">Situation</span>
                <p className="text-neutral-700 mt-1 italic">"{situation}"</p>
              </div>

              <div>
                <span className="font-semibold text-neutral-400 block uppercase tracking-wider text-[9px]">Automatic Thought</span>
                <p className="text-red-700 font-medium mt-1">"{negativeThought}"</p>
              </div>

              {(evidenceFor || evidenceAgainst) && (
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
                  <div>
                    <span className="font-semibold text-neutral-400 block uppercase tracking-wider text-[9px]">Con Facts</span>
                    <p className="text-neutral-600 mt-1">{evidenceFor || "No evidence entered"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-400 block uppercase tracking-wider text-[9px]">Pro Facts</span>
                    <p className="text-neutral-600 mt-1">{evidenceAgainst || "No evidence entered"}</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <button
                id="tc-prev-s5"
                onClick={handlePrevStep}
                disabled={loading}
                className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition text-xs"
              >
                Back
              </button>
              
              <button
                id="tc-execute-reframe-btn"
                onClick={executeReframeAPI}
                disabled={loading}
                className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition text-xs font-semibold flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-neutral-400" />
                    AI Analyzing Thought Patterns...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Reframe with AI Guided CBT
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: AI REFRAMING RESULTS */}
        {step === 6 && aiResult && (
          <div className="space-y-6" id="tc-step-6">
            <div className="text-center">
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center justify-center gap-1">
                <Layout className="w-3.5 h-3.5" />
                Balanced Mindset Reconstruct Completed
              </span>
              <h2 className="text-xl font-medium text-neutral-800 mt-1">Your AI-Guided Reframe Plan</h2>
            </div>

            {/* AI Response Block */}
            <div className="space-y-5">
              {/* Validation */}
              <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-5 space-y-2">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  Validation & Empathy
                </h4>
                <p className="text-xs text-neutral-700 leading-relaxed italic">
                  "{aiResult.empathy}"
                </p>
              </div>

              {/* Deconstruction */}
              <div className="bg-neutral-50 rounded-2xl p-5 space-y-2 border border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-neutral-500" />
                  Deconstructing Thought Distortions
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-wrap">
                  {aiResult.deconstruction}
                </p>
              </div>

              {/* Reframes */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Constructive Alternative Reframes:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {aiResult.reframes.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-neutral-100 rounded-xl shadow-xs hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500 transition cursor-default"
                    >
                      <span className="text-[10px] font-mono text-neutral-400 block pb-1">Mantra {idx + 1}</span>
                      <p className="text-xs text-neutral-700 font-medium leading-relaxed">
                        {ref}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sensory Mindfulness Action */}
              <div className="bg-amber-50/20 border border-amber-100 rounded-2xl p-5 space-y-2">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Interactive Grounding Action
                </h4>
                <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                  {aiResult.microAction}
                </p>
              </div>
            </div>

            {/* Usefulness Feedback */}
            <div className="pt-4 border-t border-neutral-100 flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-neutral-500">How helpful is this AI-guided CBT reframe?</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    id={`reframe-rate-star-${star}`}
                    onClick={() => setUsefulness(star)}
                    className="p-1 hover:scale-110 transition focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        usefulness >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-neutral-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-end pt-2">
              <button
                id="tc-save-thought-log-btn"
                onClick={handleFinalizeSave}
                className="px-6 py-2.5 bg-neutral-950 text-white rounded-xl hover:bg-neutral-850 transition text-xs font-semibold flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                Save to Private CBT Log
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
