import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle, Send, FileText, Brain } from "lucide-react";

const ACTIVITIES = [
  { id: 1, action: "Applied to Frontend Developer at TechVerse AI", time: "2 min ago", status: "applied", icon: Send },
  { id: 2, action: "AI scored Full Stack Engineer at NeuralStack — 85%", time: "5 min ago", status: "scored", icon: Brain },
  { id: 3, action: "Email sent to DesignLab Pro HR", time: "8 min ago", status: "sent", icon: Send },
  { id: 4, action: "Resume optimized for React Developer role", time: "12 min ago", status: "optimized", icon: FileText },
  { id: 5, action: "Application to ScaleUp.io — Rejected (low match)", time: "15 min ago", status: "rejected", icon: XCircle },
  { id: 6, action: "Interview quiz completed — Score 4/5", time: "20 min ago", status: "completed", icon: CheckCircle2 },
];

const statusIcon: Record<string, { color: string }> = {
  applied: { color: "text-secondary" },
  scored: { color: "text-primary" },
  sent: { color: "text-accent" },
  optimized: { color: "text-secondary" },
  rejected: { color: "text-destructive" },
  completed: { color: "text-secondary" },
};

const ActivityLog = () => {
  return (
    <section className="px-4 py-20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
            Activity <span className="gradient-text">Log</span>
          </h2>
          <p className="text-muted-foreground">Real-time pipeline activity</p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {ACTIVITIES.map((activity, i) => {
              const Icon = activity.icon;
              const { color } = statusIcon[activity.status];
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative flex items-start gap-4 pl-12"
                >
                  <div className={`absolute left-4 top-3 w-5 h-5 rounded-full bg-background flex items-center justify-center border border-border`}>
                    <Icon className={`w-3 h-3 ${color}`} />
                  </div>
                  <div className="glass-card p-4 flex-1">
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {activity.time}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivityLog;
