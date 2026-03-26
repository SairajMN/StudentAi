import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onStart: () => void;
}

const FloatingOrb = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Animated background orbs */}
      <FloatingOrb className="w-96 h-96 bg-primary -top-20 -left-20" delay={0} />
      <FloatingOrb className="w-72 h-72 bg-secondary top-1/3 right-10" delay={2} />
      <FloatingOrb className="w-80 h-80 bg-accent bottom-10 left-1/3" delay={4} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-secondary" />
            Powered by Advanced AI
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold tracking-tight mb-6"
        >
          Your{" "}
          <span className="gradient-text">AI Placement</span>
          <br />
          Officer
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Upload your resume, pick a role, and let our AI agent find, score, and apply to jobs —
          complete with tailored emails and interview prep.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={onStart}
            className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-heading font-semibold neon-glow"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Job Hunt
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-glass-border bg-glass backdrop-blur-sm hover:bg-glass-border text-foreground px-8 py-6 text-lg font-heading"
          >
            See How It Works
          </Button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 flex flex-wrap justify-center gap-3"
        >
          {[
            { icon: Bot, text: "AI Matching" },
            { icon: Zap, text: "Auto-Apply" },
            { icon: Sparkles, text: "Smart Emails" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-sm text-muted-foreground">
              <Icon className="w-4 h-4 text-primary" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
