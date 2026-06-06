import { useState, FormEvent } from "react";
import { DistortionType, ReframedThought } from "../types";
import { Sparkles, ArrowRight, Star, Heart, Check, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface QuickReframeProps {
  initialThoughtText?: string;
  onSave: (thought: ReframedThought) => void;
}

export default function QuickReframe({ initialThoughtText = "", onSave }: QuickReframeProps) {
  const [context, setContext] = useState<"commute" | "work">("commute");
  const [negativeThought, setNegativeThought] = useState(initialThoughtText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    empathy: string;
    deconstruction: string;
    reframes: string[];
    microAction: string;
  } | null>(null);

  const [usefulness, setUsefulness] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);

  const handleInstantReframe = async (e: FormEvent) => {
    e.preventDefault();
    if (!negativeThought.trim()) return;

    setLoading(true);
    setError(null);
    setAiResult(null);
    setIsSaved(false);

    try {
      const response = await fetch("/api/reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          negativeThought,
          context,
          situation: `On-the-go stress during day-to-day ${context}`,
          distortions: [] // AI will auto-determine
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quick reframing.");
      }

      setAiResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during reframing.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSave = () => {
    if (!aiResult) return;
    const reframedItem: ReframedThought = {
      id: "quick_thought_" + Date.now(),
      timestamp: new Date().toISOString(),
      situation: `Quick reframe on-the-go`,
      context,
      negativeThought,
      distortions: [], // Auto-detected during CBT session
      evidenceFor: "Anxious moment automatic thought",
      evidenceAgainst: "AI-guided perspective balance",
      alternativeThought: aiResult.reframes[0] || "I choose balanced presence.",
      aiExplanation: `${aiResult.empathy}\n\n${aiResult.deconstruction}\n\nGrounding: ${aiResult.microAction}`,
      usefulnessRating: usefulness
    };

    onSave(reframedItem);
    setIsSaved(true);
  };

  const handleReset = () => {
    setNegativeThought("");
    setAiResult(null);
    setError(null);
    setIsSaved(false);
    setUsefulness(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6" id="quick-reframe-container">
      <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-neutral-100 gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              On-The-Go Quick Reframe
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Enter a stressful thought instantly. Get a constructive CBT reframe in seconds.
            </p>
          </div>

          <div className="flex bg-neutral-100 rounded-xl p-1 self-start md:self-center" id="quick-context-toggle">
            <button
              id="qr-context-commute"
              type="button"
              onClick={() => setContext("commute")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                context === "commute"
                  ? "bg-white text-neutral-800 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              🚗 Commute
            </button>
            <button
              id="qr-context-work"
              type="button"
              onClick={() => setContext("work")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                context === "work"
                  ? "bg-white text-neutral-800 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              💻 Work Stress
            </button>
          </div>
        </div>

        {!aiResult ? (
          <form onSubmit={handleInstantReframe} className="space-y-5 pt-5" id="quick-reframe-form">
            <div className="space-y-2">
              <label htmlFor="quick-thought-input" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
                What negative or overwhelming thought is on your mind?
              </label>
              <textarea
                id="quick-thought-input"
                rows={4}
                value={negativeThought}
                onChange={(e) => setNegativeThought(e.target.value)}
                placeholder={
                  context === "commute"
                    ? "e.g., I'm stuck on this train. My morning is completely ruined and I hate this daily routine..."
                    : "e.g., I stumbled twice reading my slides. Everyone in the conference room probably thinks I'm a complete fraud..."
                }
                className="w-full text-sm p-4 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-neutral-400"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                id="qr-submit-btn"
                type="submit"
                disabled={loading || !negativeThought.trim()}
                className="px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition text-xs font-semibold flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-neutral-400" />
                    Connecting to AI Counselor...
                  </>
                ) : (
                  <>
                    Instant Reframe
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 pt-5" id="quick-reframe-results">
            {/* Compassionate Statement */}
            <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-5 space-y-2 transition-all">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                Validating Your Reality
              </h4>
              <p className="text-xs text-neutral-700 italic leading-relaxed">
                "{aiResult.empathy}"
              </p>
            </div>

            {/* Logical alternative reframes */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Balanced Reframes To Internalize Right Now:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiResult.reframes.map((ref, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-neutral-50 rounded-xl border border-neutral-150 hover:border-emerald-500 hover:bg-white hover:shadow-xs transition"
                  >
                    <span className="text-[10px] font-mono text-neutral-400 block pb-1">Reframed Perspective</span>
                    <p className="text-xs text-neutral-800 font-medium leading-relaxed">
                      {ref}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Micro-mindfulness action */}
            <div className="bg-amber-50/25 border border-amber-100 rounded-2xl p-5 space-y-2">
              <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                ⚡ Grounding Breath Anchor
              </h4>
              <p className="text-xs text-neutral-700 leading-relaxed font-mono">
                {aiResult.microAction}
              </p>
            </div>

            {/* Actions & Rating */}
            <div className="pt-4 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500">Rate this Reframe:</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      id={`qr-rate-star-${star}`}
                      onClick={() => setUsefulness(star)}
                      className="p-1 focus:outline-none hover:scale-110 transition"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          usefulness >= star ? "fill-amber-400 text-amber-400" : "text-neutral-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  id="qr-reframe-another"
                  onClick={handleReset}
                  className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-medium transition flex-1 md:flex-none"
                >
                  Challenge Another Thought
                </button>

                <button
                  id="qr-save-log"
                  onClick={handleQuickSave}
                  disabled={isSaved}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition flex-1 md:flex-none ${
                    isSaved
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-150 cursor-default"
                      : "bg-neutral-900 text-white hover:bg-neutral-800"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 font-bold" />
                      Logged Safely
                    </>
                  ) : (
                    "Save To Thought Log"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
