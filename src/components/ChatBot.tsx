import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Paperclip,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseDocument } from "@/lib/documentUtils";

const N8N_WEBHOOK_URL =
  "https://rtyui.app.n8n.cloud/webhook/3babe261-ee55-46b6-b2c9-2d6c918b939c/chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasFile?: boolean;
  fileName?: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi! I'm your AI Placement Assistant.\n\n📄 **Upload your resume** and I'll:\n• Extract your skills & experience\n• Find the best matching jobs\n• Generate personalized career guidance\n• Prepare email drafts for top 8 companies\n\nOr ask me anything about job search, interviews, or career advice!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [".pdf", ".doc", ".docx", ".txt"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(ext)) {
      alert("Please upload a PDF, DOC, DOCX, or TXT file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setAttachedFile(file);

    try {
      const parsed = await parseDocument(file);
      setResumeText(parsed.text);

      // Add a message showing the file was attached
      const fileMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: `📎 Attached resume: ${file.name}`,
        timestamp: new Date(),
        hasFile: true,
        fileName: file.name,
      };
      setMessages((prev) => [...prev, fileMessage]);

      // Auto-send for processing
      await sendMessageWithFile(parsed.text, file.name);
    } catch (error) {
      console.error("Error parsing document:", error);
      alert("Failed to parse the document. Please try again.");
      setAttachedFile(null);
    }
  };

  const sendMessageWithFile = async (text: string, fileName: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatInput: `Please analyze my resume and find matching jobs`,
          sessionId: sessionId.current,
          history: messages.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
          resumeText: text,
          fileName: fileName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let assistantContent =
        "I'm sorry, I couldn't process that request. Please try again.";

      if (typeof data === "string") {
        assistantContent = data;
      } else if (data.output) {
        assistantContent = data.output;
      } else if (data.response) {
        assistantContent = data.response;
      } else if (data.message) {
        assistantContent = data.message;
      } else if (data.text) {
        assistantContent = data.text;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "⚠️ Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatInput: userMessage.content,
          sessionId: sessionId.current,
          history: messages.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
          resumeText: resumeText,
          fileName: attachedFile?.name || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let assistantContent =
        "I'm sorry, I couldn't process that request. Please try again.";

      if (typeof data === "string") {
        assistantContent = data;
      } else if (data.output) {
        assistantContent = data.output;
      } else if (data.response) {
        assistantContent = data.response;
      } else if (data.message) {
        assistantContent = data.message;
      } else if (data.text) {
        assistantContent = data.text;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "⚠️ Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearAttachment = () => {
    setAttachedFile(null);
    setResumeText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg neon-glow"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] h-[550px] glass-card flex flex-col overflow-hidden border border-glass-border"
          >
            {/* Header */}
            <div className="p-4 border-b border-glass-border bg-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">
                    AI Placement Assistant
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Upload resume • Find jobs • Get guidance
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-secondary/20"
                          : "bg-primary/20"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-3.5 h-3.5 text-secondary" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted/50 text-foreground rounded-bl-md"
                      }`}
                    >
                      {message.hasFile && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary-foreground/20">
                          <FileText className="w-4 h-4" />
                          <span className="text-xs truncate">
                            {message.fileName}
                          </span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview */}
            {attachedFile && (
              <div className="px-4 py-2 border-t border-glass-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs text-foreground truncate flex-1">
                    {attachedFile.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={clearAttachment}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-glass-border">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="border-glass-border hover:bg-muted/50"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Upload resume or ask a question..."
                  className="flex-1 bg-muted/30 border-glass-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                📎 Upload resume for instant job matching
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
