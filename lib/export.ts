import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export interface ExportNote {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: { name: string }[];
}

export interface ExportNotebook {
  title: string;
  description: string | null;
  notes: ExportNote[];
}

// Convert HTML to Markdown
export function htmlToMarkdown(html: string): string {
  let markdown = html;

  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");

  // Bold and Italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");

  // Links
  markdown = markdown.replace(
    /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi,
    "[$2]($1)"
  );

  // Images
  markdown = markdown.replace(
    /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
    "![$2]($1)"
  );
  markdown = markdown.replace(
    /<img[^>]*src="([^"]*)"[^>]*\/?>/gi,
    "![]($1)"
  );

  // Lists
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  });
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    let index = 1;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
      return `${index++}. $1\n`;
    });
  });

  // Blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n\n");

  // Code blocks
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");
  markdown = markdown.replace(/<pre[^>]*>(.*?)<\/pre>/gi, "```\n$1\n```\n\n");

  // Line breaks and paragraphs
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n");
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");

  // Horizontal rule
  markdown = markdown.replace(/<hr[^>]*\/?>/gi, "---\n\n");

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, "");

  // Decode HTML entities
  markdown = markdown.replace(/&nbsp;/g, " ");
  markdown = markdown.replace(/&amp;/g, "&");
  markdown = markdown.replace(/&lt;/g, "<");
  markdown = markdown.replace(/&gt;/g, ">");
  markdown = markdown.replace(/&quot;/g, '"');
  markdown = markdown.replace(/&#39;/g, "'");

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, "\n\n");
  markdown = markdown.trim();

  return markdown;
}

// Export single note to Markdown
export function exportNoteToMarkdown(note: ExportNote): string {
  let markdown = "";

  if (note.title) {
    markdown += `# ${note.title}\n\n`;
  }

  if (note.tags.length > 0) {
    markdown += `标签: ${note.tags.map((t) => t.name).join(", ")}\n\n`;
  }

  markdown += `---\n\n`;
  markdown += `创建时间: ${new Date(note.createdAt).toLocaleString("zh-CN")}\n`;
  markdown += `更新时间: ${new Date(note.updatedAt).toLocaleString("zh-CN")}\n\n`;
  markdown += `---\n\n`;

  markdown += htmlToMarkdown(note.content);

  return markdown;
}

// Export single note to TXT
export function exportNoteToTXT(note: ExportNote): string {
  let text = "";

  if (note.title) {
    text += `${note.title}\n`;
    text += `${"=".repeat(note.title.length)}\n\n`;
  }

  if (note.tags.length > 0) {
    text += `标签: ${note.tags.map((t) => t.name).join(", ")}\n\n`;
  }

  text += `创建时间: ${new Date(note.createdAt).toLocaleString("zh-CN")}\n`;
  text += `更新时间: ${new Date(note.updatedAt).toLocaleString("zh-CN")}\n\n`;
  text += `${"-".repeat(40)}\n\n`;

  // Convert HTML to plain text
  const plainText = note.content
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  text += plainText;

  return text;
}

// Export notebook to Markdown
export function exportNotebookToMarkdown(notebook: ExportNotebook): string {
  let markdown = "";

  markdown += `# ${notebook.title}\n\n`;

  if (notebook.description) {
    markdown += `${notebook.description}\n\n`;
  }

  markdown += `---\n\n`;
  markdown += `共 ${notebook.notes.length} 篇笔记\n\n`;
  markdown += `---\n\n`;

  // Table of contents
  markdown += `## 目录\n\n`;
  notebook.notes.forEach((note, index) => {
    markdown += `${index + 1}. ${note.title || "无标题"}\n`;
  });
  markdown += `\n---\n\n`;

  // Notes content
  notebook.notes.forEach((note, index) => {
    markdown += `## ${index + 1}. ${note.title || "无标题"}\n\n`;
    markdown += htmlToMarkdown(note.content);
    markdown += `\n\n---\n\n`;
  });

  return markdown;
}

// Download file
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export to PDF (single note)
export async function exportNoteToPDF(
  note: ExportNote,
  elementId: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Element not found");
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  let imgY = 10;

  // Add title
  if (note.title) {
    pdf.setFontSize(20);
    pdf.text(note.title, pdfWidth / 2, 20, { align: "center" });
    imgY = 30;
  }

  // Add content
  pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);

  pdf.save(`${note.title || "未命名"}.pdf`);
}

// Import Markdown/TXT file
export function parseMarkdownFile(content: string): {
  title: string | null;
  content: string;
} {
  let title: string | null = null;
  let body = content;

  // Try to extract title from first line
  const lines = content.split("\n");
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Check if it's a markdown header
    if (firstLine.startsWith("# ")) {
      title = firstLine.substring(2).trim();
      body = lines.slice(1).join("\n").trim();
    } else if (firstLine && !firstLine.startsWith("-")) {
      title = firstLine;
      body = lines.slice(1).join("\n").trim();
    }
  }

  // Convert markdown to HTML (basic conversion)
  let html = body
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" />')
    .replace(/^- (.*$)/gim, "<li>$1</li>")
    .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
    .replace(/^(<li>.*<\/li>\n?)+/gim, "<ul>$&</ul>")
    .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
    .replace(/`([^`]+)`/gim, "<code>$1</code>")
    .replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>")
    .replace(/\n/gim, "<br />");

  return { title, content: html };
}
