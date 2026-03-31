"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Download,
  FileText,
  FileCode,
  FileType,
  Loader2,
  Check,
} from "lucide-react";
import {
  exportNoteToMarkdown,
  exportNoteToTXT,
  exportNotebookToMarkdown,
  downloadFile,
  ExportNote,
  ExportNotebook,
} from "@/lib/export";

interface ExportButtonProps {
  type: "note" | "notebook";
  data: ExportNote | ExportNotebook;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}

export function ExportButton({
  type,
  data,
  variant = "outline",
  size = "sm",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      let content: string;
      let filename: string;

      if (type === "note") {
        const note = data as ExportNote;
        content = exportNoteToMarkdown(note);
        filename = `${note.title || "未命名"}.md`;
      } else {
        const notebook = data as ExportNotebook;
        content = exportNotebookToMarkdown(notebook);
        filename = `${notebook.title}.md`;
      }

      downloadFile(content, filename, "text/markdown");
      showSuccessToast();
    } catch (error) {
      toast.error("导出失败");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTXT = async () => {
    setIsExporting(true);
    try {
      if (type === "note") {
        const note = data as ExportNote;
        const content = exportNoteToTXT(note);
        downloadFile(content, `${note.title || "未命名"}.txt`, "text/plain");
        showSuccessToast();
      }
    } catch (error) {
      toast.error("导出失败");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    toast.info("PDF导出功能需要安装额外依赖，请先运行: npm install jspdf html2canvas");
  };

  const showSuccessToast = () => {
    setShowSuccess(true);
    toast.success("导出成功");
    setTimeout(() => setShowSuccess(false), 2000);
  };

  if (isExporting) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        导出中...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          {showSuccess ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          导出
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportMarkdown}>
          <FileCode className="h-4 w-4 mr-2" />
          导出为 Markdown
        </DropdownMenuItem>
        {type === "note" && (
          <DropdownMenuItem onClick={handleExportTXT}>
            <FileText className="h-4 w-4 mr-2" />
            导出为 TXT
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileType className="h-4 w-4 mr-2" />
          导出为 PDF
          <span className="ml-2 text-xs text-muted-foreground">(Beta)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
