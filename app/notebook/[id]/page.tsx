"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string | null;
  content: string;
  order: number;
  isStarred: boolean;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  tags: { id: string; name: string; color: string }[];
  _count: {
    images: number;
  };
}

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  coverType: string;
  coverValue: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
  notes: Note[];
  _count: {
    notes: number;
  };
}

export default function NotebookPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);

  useEffect(() => {
    fetchNotebook();
  }, [params.id]);

  const fetchNotebook = async () => {
    try {
      const response = await fetch(`/api/notebooks/${params.id}`);
      if (!response.ok) {
        throw new Error("获取失败");
      }
      const data = await response.json();
      setNotebook(data);
    } catch (error) {
      toast.error("获取小册子失败");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">小册子不存在</h1>
          <button 
            className="fab-new-note"
            onClick={() => router.push("/bookshelf")}
          >
            返回书架
          </button>
        </div>
      </div>
    );
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (notebook.notes.length === 0) {
    return (
      <div className="booklet-detail-page">
        
        {/* 🔝 顶部导航栏 (固定在顶部) */}
        <header className="page-header">
          <div className="header-left">
            <button 
              className="back-btn"
              onClick={() => router.push("/bookshelf")}
            >
              ←
            </button>
            <h1 className="booklet-name">《{notebook.title}》</h1>
          </div>
          <div className="header-right">
            <button 
              className="btn-icon"
              onClick={() => router.push(`/notebook/${params.id}/edit`)}
            >
              ⚙️
            </button>
          </div>
        </header>

        {/* 📝 小册子信息栏 (标题下方的状态栏) */}
        <section className="booklet-meta">
          <span>📖 共 {notebook._count.notes} 篇笔记</span>
          <span>📅 创建于 {formatDate(notebook.createdAt)}</span>
        </section>

        {/* 📄 主要内容区 (空状态) */}
        <main className="notes-container">
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>还没有笔记</h3>
            <p>在这个小册子里写下你的第一篇笔记吧</p>
          </div>
        </main>

        {/* ➕ 悬浮新建笔记按钮 (FAB) */}
        <button 
          className="fab-new-note"
          onClick={() => router.push(`/note/create?notebookId=${params.id}`)}
        >
          + 新建笔记
        </button>

      </div>
    );
  }

  const currentNote = notebook.notes[currentNoteIndex];
  const goNext = () => {
    if (currentNoteIndex < notebook.notes.length - 1) {
      setCurrentNoteIndex(currentNoteIndex + 1);
    }
  };
  const goPrev = () => {
    if (currentNoteIndex > 0) {
      setCurrentNoteIndex(currentNoteIndex - 1);
    }
  };
  const handleNoteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentNoteIndex(Number(e.target.value));
  };

  return (
    <div className="booklet-preview-page">
      
      {/* 🔝 顶部小册子信息区 */}
      <header className="page-header">
        <button 
          className="back-btn"
          onClick={() => router.push("/bookshelf")}
        >
          ← 返回书架
        </button>
        <h1 className="booklet-title">《{notebook.title}》</h1>
        <div className="booklet-meta">
          <span>共 {notebook._count.notes} 篇笔记</span>
          <span>创建于 {formatDate(notebook.createdAt)}</span>
        </div>
      </header>

      {/* 📖 核心翻页预览区 */}
      <main className="preview-container">
        {/* 左侧翻页按钮 */}
        <button 
          className="page-turn-btn prev-btn"
          title="上一篇"
          onClick={goPrev}
          disabled={currentNoteIndex === 0}
        >
          ‹
        </button>

        {/* 笔记卡片（核心内容） */}
        <div className="note-card">
          {/* 卡片顶部：页码+编辑按钮 */}
          <div className="card-header">
            <span className="page-num">{currentNoteIndex + 1} / {notebook.notes.length}</span>
            <button 
              className="edit-btn"
              onClick={() => router.push(`/note/${currentNote.id}/edit`)}
            >
              编辑
            </button>
          </div>
          
          {/* 笔记内容 */}
          <div className="note-content">
            <h2 className="note-title">{currentNote.title || "无标题"}</h2>
            <p className="note-desc">{currentNote.content.replace(/<[^>]*>/g, '').substring(0, 100)}...</p>
          </div>
          
          {/* 卡片底部：字数统计 */}
          <div className="card-footer">
            <span className="word-count">{currentNote.wordCount} 字</span>
          </div>
        </div>

        {/* 右侧翻页按钮 */}
        <button 
          className="page-turn-btn next-btn"
          title="下一篇"
          onClick={goNext}
          disabled={currentNoteIndex === notebook.notes.length - 1}
        >
          ›
        </button>
      </main>

      {/* 📍 底部导航区 */}
      <footer className="bottom-nav">
        {/* 笔记下拉选择器 */}
        <select 
          className="note-selector"
          value={currentNoteIndex}
          onChange={handleNoteChange}
        >
          {notebook.notes.map((note, index) => (
            <option key={note.id} value={index}>
              {index + 1}. {note.title || "无标题"}
            </option>
          ))}
        </select>
      </footer>

      {/* ➕ 悬浮新建笔记按钮 (FAB) */}
      <button 
        className="fab-new-note"
        onClick={() => router.push(`/note/create?notebookId=${params.id}`)}
      >
        + 新建笔记
      </button>

    </div>
  );
}
