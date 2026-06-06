/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { BookOpen, Sparkles, ClipboardCheck, History, Heart, Trash2, Calendar, MapPin, Briefcase, Activity, RefreshCw } from "lucide-react";
import CBTModules from "./components/CBTModules";
import ThoughtChallenger from "./components/ThoughtChallenger";
import QuickReframe from "./components/QuickReframe";
import { ReframedThought, DistortionType } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"modules" | "quick" | "full" | "journal">("modules");
  
  // Shared state for when user comes from a lesson to reframe
  const [pendingThought, setPendingThought] = useState("");
  const [pendingContext, setPendingContext] = useState<"commute" | "work">("commute");

  // Keep journal items in localStorage
  const [journal, setJournal] = useState<ReframedThought[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cbt_journal_logs") || "[]");
    } catch {
      return [];
    }
  });

  const saveToJournal = (item: ReframedThought) => {
    const updated = [item, ...journal];
    setJournal(updated);
    localStorage.setItem("cbt_journal_logs", JSON.stringify(updated));
    // After saving, take the user directly to the journal to celebrate progress!
    setActiveTab("journal");
  };

  const deleteJournalItem = (id: string) => {
    const updated = journal.filter(item => item.id !== id);
    setJournal(updated);
    localStorage.setItem("cbt_journal_logs", JSON.stringify(updated));
  };

  // Aggregated Stats
  const commuteCount = journal.filter(j => j.context === "commute").length;
  const workCount = journal.filter(j => j.context === "work").length;

  // Find most common distortions in the user's logs
  const distortionCounts: Record<string, number> = {};
  journal.forEach(item => {
    item.distortions?.forEach(dist => {
      distortionCounts[dist] = (distortionCounts[dist] || 0) + 1;
    });
  });
  const sortedDistortions = Object.entries(distortionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const handleStartReframeFromLesson = (thought: string, context: "commute" | "work") => {
    setPendingThought(thought);
    setPendingContext(context);
    // Route user directly to the quick reframe tool
    setActiveTab("quick");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-neutral-800 font-sans antialiased selection:bg-emerald-100 flex flex-col" id="app-root-container">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-40" id="main-header">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              CBT
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-neutral-800">CBT Mind-Reframer</h1>
              <p className="text-xs text-neutral-500">AI-guided cognitive rebuilding during your daily commute or work</p>
            </div>
          </div>

          <nav className="flex space-x-1 bg-neutral-100/80 p-1 rounded-xl self-stretch sm:self-auto" id="main-nav-tabs">
            <button
              id="tab-btn-modules"
              onClick={() => setActiveTab("modules")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === "modules"
                  ? "bg-white text-neutral-800 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              Guides
            </button>
            <button
              id="tab-btn-quick"
              onClick={() => {
                setActiveTab("quick");
                setPendingThought("");
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === "quick"
                  ? "bg-white text-neutral-800 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-100" />
              Quick Reframe
            </button>
            <button
              id="tab-btn-full"
              onClick={() => {
                setActiveTab("full");
                setPendingThought("");
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === "full"
                  ? "bg-white text-neutral-800 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-indigo-500" />
              Full Worksheet
            </button>
            <button
              id="tab-btn-journal"
              onClick={() => setActiveTab("journal")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 positional-indicator ${
                activeTab === "journal"
                  ? "bg-white text-neutral-800 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <History className="w-3.5 h-3.5 text-neutral-500" />
              Journal ({journal.length})
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:py-8 space-y-8" id="main-content-layout">
        
        {/* CBT Statistics Banner (Only show when there is user journal history) */}
        {journal.length > 0 && activeTab !== "journal" && (
          <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4" id="tracker-summary-pane">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-50 rounded-xl block">
                <Activity className="w-5 h-5 text-emerald-600" />
              </span>
              <div>
                <span className="text-xs text-neutral-400 font-medium block">Personal Growth Insights</span>
                <span className="text-sm font-semibold text-neutral-700">
                  You have identified and resolved <strong className="text-emerald-700">{journal.length}</strong> stressful thoughts!
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
                <span className="text-neutral-600">{commuteCount} Commutes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
                <span className="text-neutral-600">{workCount} Workplace Stressors</span>
              </div>
              {sortedDistortions.length > 0 && (
                <div className="hidden lg:flex items-center gap-1 border-l border-neutral-100 pl-4 text-neutral-500">
                  <span>Primary Trap: <strong>{sortedDistortions[0][0]}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Route Handler */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            id="tab-content-wrapper"
          >
            {activeTab === "modules" && (
              <CBTModules onStartReframeFromLesson={handleStartReframeFromLesson} />
            )}

            {activeTab === "quick" && (
              <QuickReframe 
                initialThoughtText={pendingThought} 
                onSave={saveToJournal} 
              />
            )}

            {activeTab === "full" && (
              <ThoughtChallenger 
                initialThoughtText={pendingThought}
                initialContext={pendingContext}
                onSave={saveToJournal} 
                onCancel={() => setActiveTab("modules")}
              />
            )}

            {activeTab === "journal" && (
              <div className="space-y-6" id="journal-view-wrapper">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-neutral-800 flex items-center gap-2">
                      <History className="w-6 h-6 text-neutral-500" />
                      Your Private CBT Journal
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                      A visual archive of your reframed automatic thoughts. All your data stays secure privately on your browser.
                    </p>
                  </div>

                  {journal.length > 0 && (
                    <button
                      id="clear-journal-btn"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear your entire CBT journal history? This cannot be undone.")) {
                          setJournal([]);
                          localStorage.setItem("cbt_journal_logs", "[]");
                        }
                      }}
                      className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 border border-neutral-200 hover:border-red-100 rounded-lg transition self-start flex items-center gap-1 bg-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Archive
                    </button>
                  )}
                </div>

                {journal.length === 0 ? (
                  <div className="bg-white border border-neutral-100 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto shadow-xs" id="empty-journal-container">
                    <span className="text-4xl">🌱</span>
                    <h3 className="text-lg font-medium text-neutral-800">Your journal is empty</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Practice mini CBT modules or type a stressful thought instantly. Your customized AI reframing plans will be saved here to track your cognitive habits.
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        id="empty-journal-goto-modules"
                        onClick={() => setActiveTab("modules")}
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition"
                      >
                        Start Learning Modules
                      </button>
                      <button
                        id="empty-journal-goto-quick"
                        onClick={() => setActiveTab("quick")}
                        className="px-4 py-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold rounded-xl transition"
                      >
                        Try Quick Reframe
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6" id="journal-list-grid">
                    {/* Insights Bento Boxes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="insights-grid">
                      <div className="bg-white border border-neutral-100 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Thought Traps Broken</span>
                          <span className="text-2xl font-bold text-neutral-800 mt-1 block">{journal.length}</span>
                        </div>
                        <span className="p-3 bg-emerald-50 rounded-xl text-emerald-600">🏆</span>
                      </div>

                      <div className="bg-white border border-neutral-100 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Stress Environments</span>
                          <span className="text-xs font-medium text-neutral-700 mt-2 block">
                            🚗 {commuteCount} Commute | 💻 {workCount} Work
                          </span>
                        </div>
                        <span className="p-3 bg-indigo-50/50 rounded-xl text-indigo-600">📍</span>
                      </div>

                      <div className="bg-white border border-neutral-100 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Top Thought Trap</span>
                          <span className="text-xs font-medium text-neutral-700 mt-2 block">
                            {sortedDistortions.length > 0 
                              ? `${sortedDistortions[0][0]} (${sortedDistortions[0][1]} times)` 
                              : "No data yet"}
                          </span>
                        </div>
                        <span className="p-3 bg-amber-50/50 rounded-xl text-amber-600">⚠️</span>
                      </div>
                    </div>

                    {/* Journal List */}
                    {journal.map((item) => (
                      <div
                        key={item.id}
                        id={`journal-item-${item.id}`}
                        className="bg-white border border-neutral-100 rounded-2xl p-5 md:p-6 shadow-2xs space-y-4 relative group hover:border-neutral-200 transition"
                      >
                        {/* Title Context and Timestamp header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-50">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                              item.context === "commute"
                                ? "bg-amber-50 text-amber-700 border border-amber-150"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-150"
                            }`}>
                              {item.context === "commute" ? "🚗 Commute Stress" : "💻 Work Stress"}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(item.timestamp).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>

                          <button
                            id={`delete-journal-item-${item.id}`}
                            onClick={() => deleteJournalItem(item.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-50 sm:opacity-0 group-hover:opacity-100 transition absolute top-5 right-5 sm:relative sm:top-auto sm:right-auto"
                            title="Delete this entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          <div className="bg-red-50/20 border border-red-50 p-4 rounded-xl space-y-1.5">
                            <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">Automatic Thought (The Trap)</span>
                            <p className="text-xs text-neutral-700 font-medium leading-relaxed italic">
                              "{item.negativeThought}"
                            </p>
                            {item.distortions && item.distortions.length > 0 && (
                              <div className="pt-2 flex flex-wrap gap-1">
                                {item.distortions.map((dist) => (
                                  <span key={dist} className="text-[9px] bg-red-100/55 text-red-800 font-medium px-2 py-0.5 rounded-md">
                                    {dist}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="bg-emerald-50/25 border border-emerald-50 p-4 rounded-xl space-y-1.5">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                              <Heart className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                              Constructive Reframe (Balanced Mindset)
                            </span>
                            <p className="text-xs text-neutral-800 font-semibold leading-relaxed">
                              "{item.alternativeThought}"
                            </p>
                          </div>
                        </div>

                        {/* AI Deep Insights & Grounding Activity if present */}
                        {item.aiExplanation && (
                          <div className="bg-neutral-50 rounded-xl p-4 text-xs text-neutral-600 space-y-2 border border-neutral-100">
                            <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[9px] block">AI Counselor Deep Interpretation & Guided Actions</span>
                            <p className="whitespace-pre-line leading-relaxed italic">
                              {item.aiExplanation}
                            </p>
                            {item.usefulnessRating !== undefined && item.usefulnessRating > 0 && (
                              <div className="pt-2 border-t border-neutral-100 flex items-center gap-1 text-[10px] text-neutral-400">
                                <span className="font-medium">User Rating:</span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} className={s <= (item.usefulnessRating || 0) ? "text-amber-400" : "text-neutral-250"}>
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-100 bg-white py-6" id="main-footer">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-neutral-400 space-y-1">
          <p>© 2026 CBT Mind-Reframer. Built privately, securely, and and thoughtfully for high-pressure professionals.</p>
          <p>This is a cognitive training helper. If you are experiencing high critical clinical distress, please consult a healthcare professional.</p>
        </div>
      </footer>
    </div>
  );
}

