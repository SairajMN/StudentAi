import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  MapPin,
  Briefcase,
  Play,
  Loader2,
  CheckCircle2,
  Circle,
  ArrowRight,
  User,
  Mail,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/FileUpload";
import { searchJobsWithAI, JobMatch, CS_JOB_ROLES } from "@/lib/api";

const PIPELINE_STEPS = [
  { id: "fetch", label: "Fetch Jobs", icon: "🔍" },
  { id: "ai", label: "AI Analysis", icon: "🧠" },
  { id: "score", label: "Score Match", icon: "📊" },
  { id: "apply", label: "Auto Apply", icon: "📨" },
  { id: "email", label: "Send Email", icon: "✉️" },
  { id: "done", label: "Done", icon: "✅" },
];

interface DashboardProps {
  onComplete: (jobs?: JobMatch[], aiGuidance?: string) => void;
}

const Dashboard = ({ onComplete }: DashboardProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState("");
  const [resume, setResume] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("");
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const handleStart = async () => {
    if (!targetRole.trim()) return;
    setRunning(true);
    setCurrentStep(0);

    // Animate through pipeline steps while waiting for response
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < PIPELINE_STEPS.length - 1) {
        setCurrentStep(step);
      }
    }, 800);

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Use default skills if none provided
      const defaultSkills =
        skillsArray.length > 0
          ? skillsArray
          : ["JavaScript", "React", "Node.js"];

      const response = await searchJobsWithAI(
        targetRole.trim(),
        location.trim() || "India",
        defaultSkills,
      );

      clearInterval(stepInterval);

      if (response.success) {
        setCurrentStep(PIPELINE_STEPS.length - 1);
        setTimeout(
          () => onComplete(response.jobs, response.aiCareerGuidance),
          800,
        );
      } else {
        setCurrentStep(-1);
        setRunning(false);
        console.error("Job search failed:", response.error);
      }
    } catch (error) {
      clearInterval(stepInterval);
      setCurrentStep(-1);
      setRunning(false);
      console.error("Error calling job search:", error);
    }
  };

  return (
    <section className="min-h-screen px-4 py-20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-3">
            Launch Your <span className="gradient-text">AI Agent</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Paste your resume, set your target, and let AI do the rest.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 space-y-5"
          >
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Full Name
              </label>
              <Input
                placeholder="e.g. John Doe"
                className="bg-muted/30 border-glass-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Email
              </label>
              <Input
                type="email"
                placeholder="e.g. john@example.com"
                className="bg-muted/30 border-glass-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Skills
              </label>
              <Input
                placeholder="e.g. React, TypeScript, Node.js (comma separated)"
                className="bg-muted/30 border-glass-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" /> Resume (Optional)
              </label>

              <FileUpload
                onFileContent={(content, fileName) => setResume(content)}
                acceptedTypes={[".pdf", ".doc", ".docx", ".txt"]}
                maxSizeMB={10}
              />

              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Or paste your resume text directly:
                </p>
                <Textarea
                  placeholder="Paste your resume here..."
                  className="min-h-[100px] bg-muted/30 border-glass-border focus:border-primary/50 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/50 resize-none"
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-secondary" /> Target Role
              </label>
              <div className="relative">
                <select
                  className="w-full h-10 px-3 py-2 bg-muted/30 border border-glass-border rounded-md text-foreground appearance-none cursor-pointer focus:border-primary/50 focus:outline-none"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option
                    value=""
                    className="bg-background text-muted-foreground"
                  >
                    Select a CS role...
                  </option>
                  {CS_JOB_ROLES.map((role) => (
                    <option
                      key={role}
                      value={role}
                      className="bg-background text-foreground"
                    >
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" /> Location
              </label>
              <Input
                placeholder="e.g. Remote, Bangalore"
                className="bg-muted/30 border-glass-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={running || !targetRole.trim()}
              className="w-full py-6 text-lg font-heading font-semibold bg-primary hover:bg-primary/90 text-primary-foreground neon-glow disabled:opacity-40"
            >
              {running ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Running Agent...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Agent
                </span>
              )}
            </Button>
          </motion.div>

          {/* Pipeline Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 flex flex-col justify-center"
          >
            <h3 className="text-lg font-heading font-semibold mb-6 text-muted-foreground">
              Pipeline
            </h3>
            <div className="space-y-4">
              {PIPELINE_STEPS.map((step, i) => {
                const isActive = i === currentStep;
                const isDone = i < currentStep;
                return (
                  <motion.div
                    key={step.id}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "neon-border bg-primary/5"
                        : isDone
                          ? "bg-muted/20"
                          : "opacity-40"
                    }`}
                    animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                    transition={{
                      duration: 0.6,
                      repeat: isActive ? Infinity : 0,
                    }}
                  >
                    <span className="text-xl">{step.icon}</span>
                    <span
                      className={`font-medium flex-1 ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {step.label}
                    </span>
                    {isDone && (
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                    )}
                    {isActive && (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    )}
                    {!isDone && !isActive && (
                      <Circle className="w-5 h-5 text-muted-foreground/30" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
