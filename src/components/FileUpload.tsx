import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isValidDocumentFile,
  formatFileSize,
  parseDocument,
  ParsedDocument,
} from "@/lib/documentUtils";

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

const FileUpload = ({
  onFileContent,
  acceptedTypes = [".pdf", ".doc", ".docx", ".txt"],
  maxSizeMB = 10,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedContent, setParsedContent] = useState<ParsedDocument | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (selectedFile: File) => {
    setError(null);
    setLoading(true);

    try {
      // Validate file type
      if (!isValidDocumentFile(selectedFile)) {
        throw new Error(
          `Invalid file type. Accepted types: ${acceptedTypes.join(", ")}`,
        );
      }

      // Validate file size
      if (selectedFile.size > maxSizeBytes) {
        throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
      }

      setFile(selectedFile);

      // Parse the document
      const result = await parseDocument(selectedFile);
      setParsedContent(result);
      onFileContent(result.text, selectedFile.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
      setFile(null);
      setParsedContent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParsedContent(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "doc":
      case "docx":
        return <FileSpreadsheet className="w-8 h-8 text-blue-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.02]"
                : "border-glass-border hover:border-primary/50 hover:bg-muted/20"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(",")}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={
                  isDragging
                    ? { scale: 1.1, rotate: 5 }
                    : { scale: 1, rotate: 0 }
                }
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Upload
                  className={`w-12 h-12 ${
                    isDragging ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </motion.div>

              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  {isDragging
                    ? "Drop your file here"
                    : "Drag & drop your resume"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {acceptedTypes.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 text-xs rounded-full bg-muted/50 text-muted-foreground"
                  >
                    {type.toUpperCase()}
                  </span>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Max file size: {maxSizeMB}MB
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-glass-border rounded-xl p-4 bg-muted/10"
          >
            <div className="flex items-start gap-4">
              {getFileIcon(file.name)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  {parsedContent && (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                  {parsedContent?.pageCount &&
                    ` • ${parsedContent.pageCount} pages`}
                </p>

                {loading && (
                  <div className="mt-2">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Processing document...
                    </p>
                  </div>
                )}

                {parsedContent && !loading && (
                  <div className="mt-3 p-3 bg-muted/30 rounded-lg max-h-32 overflow-y-auto">
                    <p className="text-xs text-muted-foreground mb-1">
                      Extracted text preview:
                    </p>
                    <p className="text-sm text-foreground line-clamp-4">
                      {parsedContent.text.substring(0, 300)}
                      {parsedContent.text.length > 300 && "..."}
                    </p>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
