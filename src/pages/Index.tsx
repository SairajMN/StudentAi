import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Dashboard from "@/components/Dashboard";
import JobResults from "@/components/JobResults";
import ActivityLog from "@/components/ActivityLog";
import AnimatedBackground from "@/components/AnimatedBackground";
import { JobMatch } from "@/lib/api";

const views = ["hero", "dashboard", "results", "activity"] as const;

const Index = () => {
  const [currentView, setCurrentView] = useState<string>("hero");
  const [jobResults, setJobResults] = useState<JobMatch[] | undefined>();
  const [aiGuidance, setAiGuidance] = useState<string | undefined>();

  const handleDashboardComplete = (jobs?: JobMatch[], guidance?: string) => {
    setJobResults(jobs);
    setAiGuidance(guidance);
    setCurrentView("results");
  };

  const renderView = () => {
    switch (currentView) {
      case "hero":
        return <HeroSection onStart={() => setCurrentView("dashboard")} />;
      case "dashboard":
        return <Dashboard onComplete={handleDashboardComplete} />;
      case "results":
        return (
          <JobResults
            jobs={jobResults}
            aiGuidance={aiGuidance}
            onStartQuiz={() => {}}
          />
        );
      case "activity":
        return <ActivityLog />;
      default:
        return <HeroSection onStart={() => setCurrentView("dashboard")} />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar currentView={currentView} onNavigate={setCurrentView} />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
