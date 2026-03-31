"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Editor } from "@/components/editor/editor";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function CreateNoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notebookId = searchParams.get('notebookId');
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    // 简单的字数统计
    setWordCount(newContent.length);
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("请输入标题");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content,
          ...(notebookId && { notebookId }),
          isDraft: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("保存失败响应:", response.status, errorData);
        throw new Error(errorData.error || "保存失败");
      }

      const note = await response.json();
      console.log("保存成功:", note);
      toast.success("保存成功");
      router.push(`/note/${note.id}`);
    } catch (error) {
      console.error("保存失败错误:", error);
      toast.error("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // 点击面板外区域关闭设置面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const settingsPanel = document.getElementById('settings-panel');
      const btnSettings = document.getElementById('btn-settings');
      
      if (settingsPanel && btnSettings) {
        if (!settingsPanel.contains(event.target as Node) && !btnSettings.contains(event.target as Node)) {
          setIsSettingsOpen(false);
        }
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSettingsOpen]);

  const handleNewNote = () => {
    router.push("/note/create");
  };

  return (
    <div className="editor-page">
      {/* 顶部导航栏 */}
      <header className="editor-header">
        <button className="back-btn" onClick={() => router.push("/bookshelf")}>← 返回</button>
        <input 
          type="text" 
          className="title-input" 
          placeholder="输入标题..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="header-actions">
          <span className="label">标签</span>
          <select className="form-select">
            <option>个人日记</option>
            <option>旅行笔记</option>
          </select>
          <select className="form-select">
            <option>T极简</option>
            <option>文艺</option>
          </select>
          <button 
            className="new-btn"
            onClick={handleNewNote}
          >新建</button>
          <button 
            className="save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >{isSaving ? '保存中...' : '保存'}</button>
        </div>
      </header>

      {/* 编辑区 */}
      <main className="editor-content-wrapper">
        <div className="editor-paper">
          <div style={{ minHeight: '600px' }}>
            <Editor
              content={content}
              theme="minimal"
              onChange={handleContentChange}
              showToolbar={true}
            />
          </div>
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className="editor-footer">
        <span className="word-count">{wordCount} 字 0 字符</span>
      </footer>

      {/* 配套CSS样式 */}
      <style jsx>{`
        /* 页面整体 */
        .editor-page {
          background-color: #f8f5f0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
        }

        /* 顶部导航栏 */
        .editor-header {
          height: 64px;
          border-bottom: 1px solid #eaeaea;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background-color: rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .back-btn {
          border: none;
          background: transparent;
          color: #4a6c59;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .back-btn:hover {
          background-color: #f0f0f0;
        }
        .title-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 18px;
          font-weight: 500;
          color: #2d2d2d;
        }
        .title-input::placeholder {
          color: #999;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .label {
          font-size: 14px;
          color: #666;
        }
        .form-select {
          background-color: #f5f5f5;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 14px;
          color: #2d2d2d;
          outline: none;
          cursor: pointer;
        }
        .save-btn {
          background-color: #4a6c59;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 20px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .save-btn:hover {
          background-color: #3a5445;
        }
        .save-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .new-btn {
          background-color: #4a6c59;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 20px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .new-btn:hover {
          background-color: #3a5445;
        }

        /* 工具栏 */
        .toolbar {
          padding: 12px 24px;
          border-bottom: 1px solid #eaeaea;
          background-color: #fff;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          position: sticky;
          top: 64px;
          z-index: 40;
        }
        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 4px;
          padding-right: 12px;
          border-right: 1px solid #eaeaea;
        }
        .toolbar-group:last-child {
          border-right: none;
          padding-right: 0;
        }
        .toolbar-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 6px;
          background-color: transparent;
          color: #2d2d2d;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toolbar-btn:hover {
          background-color: #f0f0f0;
        }
        .toolbar-btn.active {
          background-color: #4a6c59;
          color: #fff;
        }

        /* 编辑区 */
        .editor-content-wrapper {
          flex: 1;
          padding: 32px 24px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .editor-paper {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #eaeaea;
          padding: 32px;
          min-height: 600px;
          width: 100%;
        }
        .editor-content {
          outline: none;
          min-height: 100%;
          line-height: 1.8;
          color: #2d2d2d;
        }

        /* 底部状态栏 */
        .editor-footer {
          height: 48px;
          border-top: 1px solid #eaeaea;
          padding: 0 24px;
          display: flex;
          align-items: center;
          background-color: #fff;
        }
        .word-count {
          font-size: 14px;
          color: #999;
        }
      `}</style>
    </div>
  );
}

export default function CreateNotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <CreateNoteContent />
    </Suspense>
  );
}
