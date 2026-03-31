"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateThemeStyles, getThemeById } from "@/lib/themes";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { ExportButton } from "@/components/export-button";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreVertical,
  Star,
  BookOpen,
  Tag,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Note {
  id: string;
  title: string | null;
  content: string;
  theme: string;
  isStarred: boolean;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  notebook: {
    id: string;
    title: string;
  } | null;
  tags: Tag[];
}

export default function NotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNote();
  }, [params.id]);

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${params.id}`);
      if (!response.ok) throw new Error("获取失败");
      const data = await response.json();
      setNote(data);
    } catch (error) {
      toast.error("获取笔记失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStar = async () => {
    if (!note) return;

    try {
      const response = await fetch(`/api/notes/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: !note.isStarred }),
      });

      if (!response.ok) throw new Error("操作失败");

      setNote({ ...note, isStarred: !note.isStarred });
      toast.success(note.isStarred ? "已取消星标" : "已添加星标");
    } catch (error) {
      toast.error("操作失败");
    }
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除这篇笔记吗？")) return;

    try {
      const response = await fetch(`/api/notes/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("删除失败");

      toast.success("笔记已删除");
      router.push("/bookshelf");
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleExport = () => {
    if (!note) return;

    // 显示格式选择菜单
    const format = prompt("请选择导出格式:\n1. HTML文件\n2. PDF文件\n3. 文本文件", "1");

    if (!format) return;

    switch (format) {
      case "1":
        exportAsHTML();
        break;
      case "2":
        exportAsPDF();
        break;
      case "3":
        exportAsText();
        break;
      default:
        toast.error("无效的格式选择");
    }
  };

  const exportAsHTML = () => {
    if (!note) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${note.title || "无标题"}</title>
        <style>
          body {
            font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
            line-height: 1.8;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          .meta {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #eaeaea;
          }
          .content {
            font-size: 1rem;
            color: #333;
          }
          .update-time {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #eaeaea;
            font-size: 0.9rem;
            color: #999;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <h1>${note.title || "无标题"}</h1>
        <div className="meta">
          创建于 ${formatDateTime(note.createdAt)} · ${note.wordCount} 字
        </div>
        <div className="content">
          ${note.content}
        </div>
        <div className="update-time">
          最后更新于 ${formatDateTime(note.updatedAt)}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || "无标题"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("HTML导出成功");
  };

  const exportAsPDF = () => {
    if (!note) return;

    // 简单的PDF导出，使用window.print()
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("无法打开打印窗口");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${note.title || "无标题"}</title>
        <style>
          body {
            font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
            line-height: 1.8;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          .meta {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #eaeaea;
          }
          .content {
            font-size: 1rem;
            color: #333;
          }
          .update-time {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #eaeaea;
            font-size: 0.9rem;
            color: #999;
            text-align: right;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <h1>${note.title || "无标题"}</h1>
        <div className="meta">
          创建于 ${formatDateTime(note.createdAt)} · ${note.wordCount} 字
        </div>
        <div className="content">
          ${note.content}
        </div>
        <div className="update-time">
          最后更新于 ${formatDateTime(note.updatedAt)}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };

    toast.success("PDF导出成功");
  };

  const exportAsText = () => {
    if (!note) return;

    // 提取文本内容
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    const text = `
${note.title || "无标题"}

创建于: ${formatDateTime(note.createdAt)}
字数: ${note.wordCount} 字

${textContent}

最后更新于: ${formatDateTime(note.updatedAt)}
    `;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || "无标题"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("文本导出成功");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">笔记不存在</h1>
          <Button asChild>
            <Link href="/">返回书架</Link>
          </Button>
        </div>
      </div>
    );
  }

  const theme = getThemeById(note.theme);

  return (
    <div className="note-detail-page"> 
      
      {/* 🔝 顶部导航栏（和其他页面统一） */} 
      <header className="page-header"> 
        <div className="header-left"> 
          <button 
            className="back-btn"
            onClick={() => router.push("/bookshelf")}
          >←</button> 
        </div> 
        <div className="header-right"> 
          <button 
            className="icon-btn" 
            title="返回小册子"
            onClick={() => router.push(note.notebook ? `/notebook/${note.notebook.id}` : "/bookshelf")}
          >📔</button> 
          <button 
            className="icon-btn" 
            title="添加星标"
            onClick={handleStar}
          >⭐</button> 
          <button 
            className="icon-btn" 
            title="导出"
            onClick={handleExport}
          >📥</button> 
          <button 
            className="icon-btn" 
            title="更多"
          >⋮</button> 
          <button 
            className="primary-btn"
            onClick={() => router.push(`/note/${params.id}/edit`)}
          >编辑</button> 
        </div> 
      </header> 

      {/* 📝 笔记标题区 */} 
      <div className="note-title-wrapper"> 
        <h1 className="note-title">{note.title || "无标题"}</h1> 
        <div className="note-meta"> 
          <span>📅 创建于 {formatDateTime(note.createdAt)}</span> 
          <span>·</span> 
          <span>📄 {note.wordCount} 字</span> 
        </div> 
      </div> 

      {/* 📄 笔记内容区（纸感卡片） */} 
      <main className="note-content-card"> 
        <div 
          className="note-content"
          dangerouslySetInnerHTML={{ __html: note.content }}
        > 
        </div> 
        <div className="update-time"> 
          最后更新于 {formatDateTime(note.updatedAt)} 
        </div> 
      </main> 

    </div>
  );
}
