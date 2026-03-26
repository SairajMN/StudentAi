import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  generatePDF,
  generateDOCX,
  generateCoverLetterPDF,
  GenerateDocumentOptions,
} from "@/lib/documentUtils";

type DocumentType = "pdf" | "docx" | "cover-letter";

interface DocumentGeneratorProps {
  defaultTitle?: string;
  defaultContent?: string;
}

const DocumentGenerator = ({
  defaultTitle = "",
  defaultContent = "",
}: DocumentGeneratorProps) => {
  const [docType, setDocType] = useState<DocumentType>("pdf");
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);

  // Cover letter specific fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");

  const handleGenerate = async () => {
    setLoading(true);

    try {
      switch (docType) {
        case "pdf":
          generatePDF({
            title: title || "Document",
            content,
            author: author || undefined,
            fileName: `${title.replace(/\s+/g, "_") || "document"}.pdf`,
          });
          break;

        case "docx":
          await generateDOCX({
            title: title || "Document",
            content,
            author: author || undefined,
            fileName: `${title.replace(/\s+/g, "_") || "document"}.docx`,
          });
          break;

        case "cover-letter":
          generateCoverLetterPDF(
            name,
            email,
            phone,
            company,
            position,
            content,
          );
          break;
      }
    } catch (error) {
      console.error("Failed to generate document:", error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = () => {
    if (docType === "cover-letter") {
      return name && email && company && position && content;
    }
    return title && content;
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <h3 className="text-lg font-heading font-semibold text-foreground">
        Generate Document
      </h3>

      {/* Document Type Selection */}
      <div className="flex gap-3">
        <Button
          variant={docType === "pdf" ? "default" : "outline"}
          onClick={() => setDocType("pdf")}
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          PDF
        </Button>
        <Button
          variant={docType === "docx" ? "default" : "outline"}
          onClick={() => setDocType("docx")}
          className="flex-1"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Word
        </Button>
        <Button
          variant={docType === "cover-letter" ? "default" : "outline"}
          onClick={() => setDocType("cover-letter")}
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          Cover Letter
        </Button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {docType === "cover-letter" ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Your Name
                </label>
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-muted/30 border-glass-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/30 border-glass-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Phone
                </label>
                <Input
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-muted/30 border-glass-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Company
                </label>
                <Input
                  placeholder="Acme Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-muted/30 border-glass-border"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Position
              </label>
              <Input
                placeholder="Frontend Developer"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="bg-muted/30 border-glass-border"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Document Title
              </label>
              <Input
                placeholder="My Document"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-muted/30 border-glass-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Author (optional)
              </label>
              <Input
                placeholder="Your Name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="bg-muted/30 border-glass-border"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            {docType === "cover-letter" ? "Cover Letter Content" : "Content"}
          </label>
          <Textarea
            placeholder={
              docType === "cover-letter"
                ? "Dear Hiring Manager, I am writing to express my interest..."
                : "Enter your document content here..."
            }
            className="min-h-[200px] bg-muted/30 border-glass-border resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={loading || !isValid()}
        className="w-full py-6 text-lg font-heading font-semibold bg-primary hover:bg-primary/90 text-primary-foreground neon-glow disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Download className="w-5 h-5" /> Generate{" "}
            {docType === "pdf"
              ? "PDF"
              : docType === "docx"
                ? "Word Document"
                : "Cover Letter"}
          </span>
        )}
      </Button>
    </div>
  );
};

export default DocumentGenerator;
