import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const QUESTIONS = [
  {
    q: "What hook is used for side effects in React?",
    options: ["useState", "useEffect", "useRef", "useMemo"],
    correct: 1,
  },
  {
    q: "Which CSS property enables glassmorphism?",
    options: ["box-shadow", "backdrop-filter", "opacity", "mix-blend-mode"],
    correct: 1,
  },
  {
    q: "What does TypeScript's 'interface' define?",
    options: ["A function body", "Object shape contract", "A class method", "Variable type alias only"],
    correct: 1,
  },
  {
    q: "What is the virtual DOM?",
    options: ["Browser API", "Lightweight JS representation of DOM", "CSS framework", "Server-side renderer"],
    correct: 1,
  },
  {
    q: "Which HTTP method is idempotent?",
    options: ["POST", "PATCH", "PUT", "CONNECT"],
    correct: 2,
  },
];

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
}

const QuizModal = ({ open, onClose }: QuizModalProps) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === QUESTIONS[current].correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= QUESTIONS.length) {
      setShowResult(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleReset = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
    onClose();
  };

  const q = QUESTIONS[current];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={handleReset}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-card neon-border p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold">Interview Prep</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground" onClick={handleReset}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {showResult ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <Trophy className="w-16 h-16 text-secondary mx-auto mb-4" />
                <p className="text-3xl font-heading font-bold mb-2">
                  {score}/{QUESTIONS.length}
                </p>
                <p className="text-muted-foreground mb-6">
                  {score >= 4 ? "Excellent! You're interview-ready!" : score >= 2 ? "Good effort! Keep practicing." : "Review the topics and try again."}
                </p>
                <Button onClick={handleReset} className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading">
                  Done
                </Button>
              </motion.div>
            ) : (
              <>
                <Progress
                  value={((current + 1) / QUESTIONS.length) * 100}
                  className="h-1.5 mb-6 bg-muted"
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-xs text-muted-foreground font-mono mb-2">
                      Question {current + 1}/{QUESTIONS.length}
                    </p>
                    <p className="font-heading font-medium text-lg mb-5">{q.q}</p>

                    <div className="space-y-2.5">
                      {q.options.map((opt, i) => {
                        let cls = "glass-card p-3 cursor-pointer transition-all duration-200 hover:border-primary/40";
                        if (answered) {
                          if (i === q.correct) cls = "border border-secondary/60 bg-secondary/10 p-3";
                          else if (i === selected) cls = "border border-destructive/60 bg-destructive/10 p-3";
                          else cls = "glass-card p-3 opacity-40";
                        }
                        return (
                          <motion.button
                            key={i}
                            whileTap={!answered ? { scale: 0.98 } : {}}
                            onClick={() => handleSelect(i)}
                            className={`w-full text-left rounded-lg flex items-center gap-3 ${cls}`}
                          >
                            <span className="w-6 h-6 rounded-full border border-glass-border flex items-center justify-center text-xs font-mono">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-sm">{opt}</span>
                            {answered && i === q.correct && <CheckCircle2 className="w-4 h-4 text-secondary ml-auto" />}
                            {answered && i === selected && i !== q.correct && <XCircle className="w-4 h-4 text-destructive ml-auto" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {answered && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                    <Button
                      onClick={handleNext}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading"
                    >
                      {current + 1 >= QUESTIONS.length ? "See Results" : "Next Question"}
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizModal;
