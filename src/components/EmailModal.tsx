import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface EmailModalProps {
  job: { role: string; company: string } | null;
  onClose: () => void;
}

const EmailModal = ({ job, onClose }: EmailModalProps) => {
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleOpen = () => {
    if (job) {
      setSubject(`Application for ${job.role} — Enthusiastic & Skilled Candidate`);
      setBody(`Dear Hiring Team at ${job.company},\n\nI'm writing to express my strong interest in the ${job.role} position. With hands-on experience in modern web technologies and a passion for building user-centric products, I believe I'd be a great addition to your team.\n\nKey strengths I bring:\n• Proficient in React, TypeScript & modern frontend tooling\n• Experience building scalable, production-grade applications\n• Strong problem-solving skills with a collaborative mindset\n\nI would love the opportunity to discuss how my skills align with your needs. Thank you for considering my application.\n\nBest regards`);
      setSent(false);
    }
  };

  // Trigger body generation when job changes
  if (job && !body) handleOpen();

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      onClose();
      setSent(false);
      setBody("");
      setSubject("");
    }, 1500);
  };

  return (
    <AnimatePresence>
      {job && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-card neon-border p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {sent ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-10 gap-4"
              >
                <CheckCircle2 className="w-16 h-16 text-secondary" />
                <p className="text-xl font-heading font-semibold">Email Sent!</p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-heading font-semibold text-lg">
                    Email to <span className="text-primary">{job.company}</span>
                  </h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-muted/30 border-glass-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Body</label>
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="min-h-[200px] bg-muted/30 border-glass-border text-foreground resize-none text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleSend}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading neon-glow"
                  >
                    <Send className="w-4 h-4 mr-2" /> Send Email
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmailModal;
