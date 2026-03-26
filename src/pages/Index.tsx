import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Dashboard from "@/components/Dashboard";
import JobResults from "@/components/JobResults";
import ActivityLog from "@/components/ActivityLog";

const views = ["hero", "dashboard", "results", "activity"] as const;

const Index = () => {
  const [currentView, setCurrentView] = useState<string>("hero");

  const renderView = () => {
    switch (currentView) {
      case "hero":
        return <HeroSection onStart={() => setCurrentView("dashboard")} />;
      case "dashboard":
        return <Dashboard onComplete={() => setCurrentView("results")} />;
      case "results":
        return <JobResults onStartQuiz={() => {}} />;
      case "activity":
        return <ActivityLog />;
      default:
        return <HeroSection onStart={() => setCurrentView("dashboard")} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
  );
};

export default Index;
