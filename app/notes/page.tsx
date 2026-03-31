"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  notebook: {
    id: string;
    title: string;
  } | null;
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) {
        throw new Error("获取失败");
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      toast.error("获取笔记失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (isLoading) {
    return (
      <div className="notes-page flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="notes-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>我的笔记</h1>
          <p className="text-sm text-gray-600">
            共 {notes.length} 篇笔记
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-state col-span-full">
            <h2>还没有笔记</h2>
            <p>创建你的第一篇笔记，开始记录吧</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              <h3 className="note-card-title">{note.title}</h3>
              <p className="note-card-content">{note.content.replace(/<[^>]*>/g, '').substring(0, 100)}...</p>
              <div className="note-card-meta">
                <span>{note.wordCount} 字</span>
                <span>{formatDate(note.createdAt)}</span>
                {note.notebook && (
                  <span className="note-card-notebook">{note.notebook.title}</span>
                )}
              </div>
              <div className="note-card-actions">
                <button 
                  className="note-card-btn"
                  onClick={() => router.push(`/note/${note.id}`)}
                >
                  查看
                </button>
                <button 
                  className="note-card-btn secondary"
                  onClick={() => router.push(`/note/${note.id}/edit`)}
                >
                  编辑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button 
        className="fab"
        onClick={() => router.push("/note/create")}
      >
        +
      </button>

      {/* Back to Bookshelf */}
      <button 
        className="back-to-bookshelf"
        onClick={() => router.push("/bookshelf")}
      >
        ← 返回书架
      </button>
    </div>
  );
}