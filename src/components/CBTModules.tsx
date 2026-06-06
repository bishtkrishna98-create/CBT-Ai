import { useState } from "react";
import { CBT_LESSONS, CBTLesson } from "../types";
import { BookOpen, Clock, ChevronRight, CheckCircle, ArrowLeft, Send, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface CBTModulesProps {
  onStartReframeFromLesson: (thought: string, context: "commute" | "work") => void;
}

export default function CBTModules({ onStartReframeFromLesson }: CBTModulesProps) {
  const [selectedLesson, setSelectedLesson] = useState<CBTLesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("completed_lessons") || "[]");
    } catch {
      return [];
    }
  });
  const [userResponse, setUserResponse] = useState("");

  const handleSelectLesson = (lesson: CBTLesson) => {
    setSelectedLesson(lesson);
    setCurrentStepIndex(0);
    setUserResponse("");
  };

  const handleNextStep = () => {
    if (!selectedLesson) return;
    if (currentStepIndex < selectedLesson.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Complete lesson
      const nextCompleted = [...completedLessons];
      if (!nextCompleted.includes(selectedLesson.id)) {
        nextCompleted.push(selectedLesson.id);
        setCompletedLessons(nextCompleted);
        localStorage.setItem("completed_lessons", JSON.stringify(nextCompleted));
      }
      
      // If user provided a thought response, let them directly reframe it
      if (userResponse.trim() && selectedLesson.steps[currentStepIndex].prompt) {
        onStartReframeFromLesson(
          userResponse, 
          selectedLesson.category === "commute" ? "commute" : "work"
        );
      }
      setSelectedLesson(null);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6" id="cbt-modules-container">
      {!selectedLesson ? (
        <div className="space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-800 flex items-center justify-center md:justify-start gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              Interactive CBT Mini-Modules
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Short, evidence-based guides targeted to calm commute anxiety or tackle work-day stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CBT_LESSONS.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              return (
                <motion.div
                  key={lesson.id}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                  id={`lesson-card-${lesson.id}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                        lesson.category === "commute" 
                          ? "bg-amber-50 text-amber-700 border border-amber-150" 
                          : lesson.category === "work" 
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-150"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-150"
                      }`}>
                        {lesson.category}
                      </span>
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {lesson.durationMinutes} min
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-neutral-800 leading-snug">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-2 line-clamp-3">
                      {lesson.shortDesc}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-neutral-50">
                    {isCompleted ? (
                      <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400">Not started</span>
                    )}

                    <button
                      id={`start-lesson-btn-${lesson.id}`}
                      onClick={() => handleSelectLesson(lesson)}
                      className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition flex items-center gap-1"
                    >
                      {isCompleted ? "Review" : "Start"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
          id="active-lesson-view"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <button
              id="back-to-modules-btn"
              onClick={() => setSelectedLesson(null)}
              className="text-neutral-500 hover:text-neutral-800 transition text-sm flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Module
            </button>
            <div className="text-right">
              <span className="text-xs text-neutral-400 font-mono">
                Step {currentStepIndex + 1} of {selectedLesson.steps.length}
              </span>
            </div>
          </div>

          {/* Step content */}
          <div className="space-y-5 py-2">
            <h3 className="text-xl font-medium text-neutral-800 tracking-tight">
              {selectedLesson.steps[currentStepIndex].title}
            </h3>
            
            <p className="text-neutral-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {selectedLesson.steps[currentStepIndex].content}
            </p>

            {selectedLesson.steps[currentStepIndex].prompt && (
              <div className="mt-6 bg-neutral-50 rounded-2xl p-5 border border-neutral-100 space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Interactive Exercise Prompt
                </label>
                <p className="text-xs text-neutral-600 font-medium">
                  {selectedLesson.steps[currentStepIndex].prompt}
                </p>
                <textarea
                  id="lesson-user-thought-input"
                  rows={3}
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="e.g. My train was slowed down and I immediately felt like my supervisor would assume I do not care about my work..."
                  className="w-full text-xs p-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
                />
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <button
              id="prev-step-btn"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`px-4 py-2 text-xs border rounded-xl transition ${
                currentStepIndex === 0 
                  ? "border-neutral-100 text-neutral-300 cursor-not-allowed" 
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              Previous
            </button>

            <button
              id="next-step-btn"
              onClick={handleNextStep}
              className="px-5 py-2 text-xs bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition flex items-center gap-1.5 font-medium"
            >
              {currentStepIndex < selectedLesson.steps.length - 1 ? (
                <>Next Step <ChevronRight className="w-4 h-4" /></>
              ) : userResponse.trim() ? (
                <>Finish & Reframe with AI <Send className="w-4 h-4" /></>
              ) : (
                "Finish Module"
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
