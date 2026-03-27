import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

// Types
export interface ParsedDocument {
  text: string;
  pageCount?: number;
  fileName: string;
}

export interface GenerateDocumentOptions {
  title: string;
  content: string;
  author?: string;
  fileName?: string;
}

/**
 * Parse PDF file and extract text content
 */
export async function parsePDF(file: File): Promise<ParsedDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);

        // Dynamic import to avoid issues with SSR
        const pdfjsLib = await import("pdfjs-dist");

        // Configure worker for Vite - use inline worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.mjs",
          import.meta.url,
        ).toString();

        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ");
          fullText += pageText + "\n";
        }

        resolve({
          text: fullText.trim(),
          pageCount: pdf.numPages,
          fileName: file.name,
        });
      } catch (error) {
        reject(
          new Error(
            `Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
          ),
        );
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse DOC/DOCX file and extract text content
 */
export async function parseDOC(file: File): Promise<ParsedDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        // Dynamic import for mammoth
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer });

        resolve({
          text: result.value.trim(),
          fileName: file.name,
        });
      } catch (error) {
        reject(
          new Error(
            `Failed to parse DOC: ${error instanceof Error ? error.message : "Unknown error"}`,
          ),
        );
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse any supported document file
 */
export async function parseDocument(file: File): Promise<ParsedDocument> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return parsePDF(file);
    case "doc":
    case "docx":
      return parseDOC(file);
    case "txt":
      return parseTextFile(file);
    default:
      throw new Error(`Unsupported file format: .${extension}`);
  }
}

/**
 * Parse plain text file
 */
async function parseTextFile(file: File): Promise<ParsedDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve({
        text: text.trim(),
        fileName: file.name,
      });
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Generate a PDF document
 */
export function generatePDF(options: GenerateDocumentOptions): void {
  const { title, content, author, fileName = "document.pdf" } = options;

  const doc = new jsPDF();

  // Set metadata
  doc.setProperties({
    title,
    author: author || "PlaceAI",
    creator: "PlaceAI Document Generator",
  });

  // Add title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, 20);

  // Add content
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  const splitContent = doc.splitTextToSize(content, 170);
  doc.text(splitContent, 20, 35);

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  // Save the PDF
  doc.save(fileName);
}

/**
 * Generate a Word document (DOCX)
 */
export async function generateDOCX(
  options: GenerateDocumentOptions,
): Promise<void> {
  const { title, content, author, fileName = "document.docx" } = options;

  // Split content into paragraphs
  const paragraphs = content.split("\n").filter((p) => p.trim());

  const doc = new Document({
    properties: {
      title,
      author: author || "PlaceAI",
      creator: "PlaceAI Document Generator",
    },
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            spacing: {
              after: 200,
            },
          }),
          // Content paragraphs
          ...paragraphs.map(
            (para) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: para,
                    size: 24, // 12pt
                  }),
                ],
                spacing: {
                  after: 120,
                },
              }),
          ),
        ],
      },
    ],
  });

  // Generate and save the document
  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}

/**
 * Generate a cover letter PDF
 */
export function generateCoverLetterPDF(
  name: string,
  email: string,
  phone: string,
  company: string,
  position: string,
  content: string,
): void {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(name, 20, 20);
  doc.text(email, 20, 27);
  doc.text(phone, 20, 34);

  // Date
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(today, 20, 48);

  // Recipient
  doc.text(`Hiring Manager`, 20, 62);
  doc.text(company, 20, 69);

  // Subject
  doc.setFont("helvetica", "bold");
  doc.text(`Re: Application for ${position}`, 20, 83);

  // Content
  doc.setFont("helvetica", "normal");
  const splitContent = doc.splitTextToSize(content, 170);
  doc.text(splitContent, 20, 97);

  // Closing
  const closingY = 97 + splitContent.length * 7 + 10;
  doc.text("Sincerely,", 20, closingY);
  doc.text(name, 20, closingY + 10);

  // Save
  doc.save(`Cover_Letter_${company.replace(/\s+/g, "_")}.pdf`);
}

/**
 * Generate a resume PDF from structured data
 */
export function generateResumePDF(resumeData: {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{ degree: string; school: string; year: string }>;
  skills: string[];
}): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Name
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(resumeData.name, 20, yPos);
  yPos += 10;

  // Contact
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${resumeData.email} | ${resumeData.phone}`, 20, yPos);
  yPos += 12;

  // Summary
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PROFESSIONAL SUMMARY", 20, yPos);
  yPos += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(resumeData.summary, 170);
  doc.text(summaryLines, 20, yPos);
  yPos += summaryLines.length * 5 + 10;

  // Experience
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("EXPERIENCE", 20, yPos);
  yPos += 7;

  resumeData.experience.forEach((exp) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${exp.title} - ${exp.company}`, 20, yPos);
    yPos += 5;
    doc.setFont("helvetica", "italic");
    doc.text(exp.duration, 20, yPos);
    yPos += 5;
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(exp.description, 170);
    doc.text(descLines, 20, yPos);
    yPos += descLines.length * 5 + 8;
  });

  // Education
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("EDUCATION", 20, yPos);
  yPos += 7;

  resumeData.education.forEach((edu) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(edu.degree, 20, yPos);
    yPos += 5;
    doc.setFont("helvetica", "normal");
    doc.text(`${edu.school} - ${edu.year}`, 20, yPos);
    yPos += 8;
  });

  // Skills
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SKILLS", 20, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(resumeData.skills.join(" • "), 20, yPos);

  // Save
  doc.save(`${resumeData.name.replace(/\s+/g, "_")}_Resume.pdf`);
}

/**
 * Validate file type
 */
export function isValidDocumentFile(file: File): boolean {
  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const validExtensions = ["pdf", "doc", "docx", "txt"];
  const extension = file.name.split(".").pop()?.toLowerCase();

  return (
    validTypes.includes(file.type) || validExtensions.includes(extension || "")
  );
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
