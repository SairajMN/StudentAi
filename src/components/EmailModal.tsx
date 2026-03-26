import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle2, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { JobMatch, sendEmailViaGmail } from "@/lib/api";

interface EmailModalProps {
  job: JobMatch | null;
  onClose: () => void;
}

const EmailModal = ({ job, onClose }: EmailModalProps) => {
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (job) {
      // Use email draft from n8n if available, otherwise generate default
      if (job.emailSubject && job.emailDraft) {
        setSubject(job.emailSubject);
        // Extract body from draft (skip the Subject line)
        const draftLines = job.emailDraft.split("\n");
        const bodyStart = draftLines.findIndex(
          (line) => line.trim() === "" && draftLines.indexOf(line) > 0,
        );
        setBody(
          bodyStart > 0
            ? draftLines
                .slice(bodyStart + 1)
                .join("\n")
                .trim()
            : job.emailDraft,
        );
      } else {
        setSubject(
          `Application for ${job.role} — Enthusiastic & Skilled Candidate`,
        );
        setBody(
          `Dear Hiring Team at ${job.company},\n\nI'm writing to express my strong interest in the ${job.role} position. With hands-on experience in modern web technologies and a passion for building user-centric products, I believe I'd be a great addition to your team.\n\nKey strengths I bring:\n• Proficient in React, TypeScript & modern frontend tooling\n• Experience building scalable, production-grade applications\n• Strong problem-solving skills with a collaborative mindset\n\nI would love the opportunity to discuss how my skills align with your needs. Thank you for considering my application.\n\nBest regards`,
        );
      }
      setSent(false);
    }
  }, [job]);

  const handleSend = async () => {
    if (!job) return;

    setSending(true);

    // Try to send via Gmail
    const recipient = `${job.company.toLowerCase().replace(/\s+/g, "")}@example.com`;
    const result = await sendEmailViaGmail(recipient, subject, body);

    setSending(false);
    setSent(true);

    setTimeout(() => {
      onClose();
      setSent(false);
      setBody("");
      setSubject("");
    }, 2000);
  };

  const handleOpenInGmail = () => {
    if (!job) return;
    const recipient = `${job.company.toLowerCase().replace(/\s+/g, "")}@example.com`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank");
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
                <p className="text-xl font-heading font-semibold">
                  Email Ready!
                </p>
                <p className="text-sm text-muted-foreground">
                  Your email client should open shortly
                </p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-heading font-semibold text-lg">
                    Email to <span className="text-primary">{job.company}</span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Show job details */}
                <div className="mb-4 p-3 rounded-lg bg-muted/20 border border-glass-border">
                  <p className="text-sm font-medium text-foreground">
                    {job.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {job.company} • {job.location}
                  </p>
                  {job.applyUrl && (
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      View Job Posting <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Subject
                    </label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-muted/30 border-glass-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Body
                    </label>
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="min-h-[200px] bg-muted/30 border-glass-border text-foreground resize-none text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleOpenInGmail}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-heading"
                    >
                      <Mail className="w-4 h-4 mr-2" /> Open in Gmail
                    </Button>
                    <Button
                      onClick={handleSend}
                      disabled={sending}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading neon-glow"
                    >
                      {sending ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Send className="w-4 h-4" />
                          </motion.div>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" /> Send Email
                        </span>
                      )}
                    </Button>
                  </div>
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
