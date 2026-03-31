"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Editor } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { editorThemes } from "@/lib/themes";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Type,
  Image,
  Settings,
  Tag,
  X,
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
  notebookId: string | null;
  isDraft: boolean;
  tags: Tag[];
}

interface Notebook {
  id: string;
  title: string;
}

export default function EditNotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [theme, setTheme] = useState("minimal");
  const [notebookId, setNotebookId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState({ words: 0, characters: 0 });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [noteRes, notebooksRes, tagsRes] = await Promise.all([
        fetch(`/api/notes?id=${params.id}`),
        fetch("/api/notebooks"),
        fetch("/api/tags"),
      ]);

      if (!noteRes.ok) throw new Error("获取笔记失败");

      const noteData = await noteRes.json();
      const notebooksData = await notebooksRes.json();
      const tagsData = await tagsRes.json();

      setNote(noteData);
      setNotebooks(Array.isArray(notebooksData) ? notebooksData : []);
      setAllTags(Array.isArray(tagsData) ? tagsData : []);

      setTitle(noteData.title || "");
      setContent(noteData.content);
      setTheme(noteData.theme);
      setNotebookId(noteData.notebookId);
      setSelectedTagIds(noteData.tags.map((t: Tag) => t.id));
    } catch (error) {
      toast.error("获取数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleWordCountChange = useCallback(
    (count: { words: number; characters: number }) => {
      setWordCount(count);
    },
    []
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/notes?id=${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim() || null,
          content,
          theme,
          notebookId,
          tagIds: selectedTagIds,
          isDraft: false,
        }),
      });

      if (!response.ok) throw new Error("保存失败");

      toast.success("保存成功");
      router.push(`/note/${params.id}`);
    } catch (error) {
      toast.error("保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
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

  return (
    <div className="editor-page">
      {/* 顶部导航栏 */}
      <header className="editor-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => router.push("/bookshelf")}>← 返回</button>
        </div>
        <input 
          type="text" 
          className="title-input" 
          placeholder="输入标题..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="header-actions">
          <span className="label">小册子</span>
          <select 
            className="form-select" 
            value={notebookId || ""} 
            onChange={(e) => setNotebookId(e.target.value || null)}
          >
            <option value="">无</option>
            {notebooks.map((notebook) => (
              <option key={notebook.id} value={notebook.id}>{notebook.title}</option>
            ))}
          </select>
          <button 
            className="new-btn"
            onClick={() => router.push("/note/create")}
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
              onWordCountChange={handleWordCountChange}
              showToolbar={true}
            />
          </div>
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className="editor-footer">
        <span className="word-count">{wordCount.words} 字 {wordCount.characters} 字符</span>
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
        .header-left {
          display: flex;
          align-items: center;
        }
        .back-btn {
          border: none;
          background: transparent;
          color: #4a6c59;
          padding: 8px 20px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
          font-weight: 500;
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
