"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  coverType: string;
  coverValue: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    notes: number;
  };
}

export default function BookshelfPage() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const response = await fetch("/api/notebooks");
      if (!response.ok) {
        throw new Error("获取失败");
      }
      const data = await response.json();
      setNotebooks(data);
    } catch (error) {
      toast.error("获取小册子失败");
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
      <div className="bookshelf-page flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="bookshelf-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>我的书架</h1>
          <p className="text-sm text-gray-600">
            共 {notebooks.length} 本小册子
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="booklet-grid">
        {notebooks.length === 0 ? (
          <div className="empty-state col-span-full">
            <h2>还没有小册子</h2>
            <p>创建你的第一本小册子，开始记录吧</p>
            <button 
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              onClick={() => router.push("/notebook/create")}
            >
              创建小册子
            </button>
          </div>
        ) : (
          <>
            {notebooks.map((notebook) => (
              <div key={notebook.id} className="booklet-card">
                <div 
                  className="booklet-cover" 
                  style={{
                    backgroundColor: notebook.coverValue || '#4f46e5'
                  }}
                >
                  <h3 className="booklet-card-title">{notebook.title}</h3>
                </div>
                <div className="booklet-card-content">
                  <p className="booklet-card-desc">{notebook.description || "无描述"}</p>
                  <div className="booklet-card-meta">
                    <span>{notebook._count.notes} 篇笔记</span>
                    <span>{formatDate(notebook.createdAt)}</span>
                  </div>
                  <div className="booklet-card-buttons">
                    <button 
                      className="booklet-card-btn"
                      onClick={() => router.push(`/notebook/${notebook.id}`)}
                    >
                      查看
                    </button>
                    <button 
                      className="booklet-card-btn secondary"
                      onClick={() => router.push(`/notebook/${notebook.id}/edit`)}
                    >
                      编辑
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {/* 新建小册子按钮 */}
            <div className="booklet-card" onClick={() => router.push("/notebook/create")} style={{ cursor: 'pointer' }}>
              <div className="booklet-cover" style={{ backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 className="booklet-card-title" style={{ fontSize: '2rem' }}>+</h3>
              </div>
              <div className="booklet-card-content">
                <p className="booklet-card-desc">新建小册子</p>
                <div className="booklet-card-meta">
                  <span></span>
                  <span></span>
                </div>
                <button className="booklet-card-btn">
                  创建
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <div className="fab-container">
        <button 
          className="fab"
          onClick={() => router.push("/note/create")}
        >
          +
        </button>
      </div>

      {/* Navigation buttons */}
      <div style={{ position: 'fixed', bottom: '2rem', left: '2rem', display: 'flex', gap: '1rem', zIndex: 99 }}>
        <button 
          className="home-btn"
          onClick={() => router.push("/")}
        >
          首页
        </button>
        <button 
          className="go-to-notes"
          onClick={() => router.push("/notes")}
        >
          笔记列表 →
        </button>
      </div>
    </div>
  );
}