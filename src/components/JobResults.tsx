import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Star, Mail, Brain, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmailModal from "./EmailModal";
import QuizModal from "./QuizModal";

const MOCK_JOBS = [
  { id: 1, role: "Frontend Developer", company: "TechVerse AI", location: "Remote", score: 92, reason: "Strong React & TypeScript match, relevant projects", status: "Applied" },
  { id: 2, role: "Full Stack Engineer", company: "NeuralStack", location: "Bangalore", score: 85, reason: "Good Node.js + React overlap, some gaps in DevOps", status: "Pending" },
  { id: 3, role: "UI Engineer", company: "DesignLab Pro", location: "Remote", score: 78, reason: "Design system experience matches, needs more Figma", status: "Ready" },
  { id: 4, role: "React Developer", company: "CloudNine Inc", location: "Hyderabad", score: 88, reason: "Excellent framework expertise, strong portfolio", status: "Applied" },
  { id: 5, role: "Software Engineer", company: "DataPulse", location: "Remote", score: 71, reason: "Partial skill overlap, missing ML experience", status: "Ready" },
  { id: 6, role: "Frontend Lead", company: "ScaleUp.io", location: "Mumbai", score: 65, reason: "Leadership gap but strong technical foundation", status: "Rejected" },
];

const statusColors: Record<string, string> = {
  Applied: "text-secondary",
  Pending: "text-accent",
  Ready: "text-primary",
  Rejected: "text-destructive",
};

interface JobResultsProps {
  onStartQuiz: () => void;
}

const JobResults = ({ onStartQuiz }: JobResultsProps) => {
  const [emailJob, setEmailJob] = useState<typeof MOCK_JOBS[0] | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <section className="min-h-screen px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-3">
            Job <span className="gradient-text">Matches</span>
          </h2>
          <p className="text-muted-foreground text-lg">{MOCK_JOBS.length} opportunities scored by AI</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_JOBS.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card-hover p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{job.role}</h3>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <Building2 className="w-3.5 h-3.5" /> {job.company}
                  </p>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <motion.circle
                      cx="18" cy="18" r="15.5" fill="none"
                      stroke={job.score >= 80 ? "hsl(var(--secondary))" : job.score >= 65 ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                      strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${job.score * 0.975} 97.5`}
                      initial={{ strokeDasharray: "0 97.5" }}
                      animate={{ strokeDasharray: `${job.score * 0.975} 97.5` }}
                      transition={{ duration: 1, delay: i * 0.08 + 0.3 }}
                    />
                  </svg>
                  <span className="absolute text-xs font-mono font-bold">{job.score}</span>
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" /> {job.location}
              </p>

              <p className="text-xs text-muted-foreground/80 mb-4 flex-1">{job.reason}</p>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-medium ${statusColors[job.status]}`}>
                  ● {job.status}
                </span>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => setEmailJob(job)}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-secondary hover:bg-secondary/10"
                    onClick={() => setQuizOpen(true)}
                  >
                    <Brain className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <EmailModal job={emailJob} onClose={() => setEmailJob(null)} />
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />
    </section>
  );
};

export default JobResults;
