"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, LoadingSkeleton } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        <LoadingSkeleton className="w-64 h-8" />
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
          <Card className="empty-state col-span-full">
            <CardContent className="pt-6">
              <h2>还没有小册子</h2>
              <p>创建你的第一本小册子，开始记录吧</p>
              <Button
                className="mt-4"
                onClick={() => router.push("/notebook/create")}
              >
                创建小册子
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {notebooks.map((notebook) => (
              <Card key={notebook.id} className="booklet-card">
                <div
                  className="booklet-cover"
                  style={{
                    backgroundColor: notebook.coverValue || '#4f46e5'
                  }}
                >
                  <CardTitle className="booklet-card-title">{notebook.title}</CardTitle>
                </div>
                <CardContent className="booklet-card-content">
                  <CardDescription className="booklet-card-desc">
                    {notebook.description || "无描述"}
                  </CardDescription>
                  <div className="booklet-card-meta">
                    <span>{notebook._count.notes} 篇笔记</span>
                    <span>{formatDate(notebook.createdAt)}</span>
                  </div>
                  <div className="booklet-card-buttons">
                    <Button
                      className="booklet-card-btn"
                      onClick={() => router.push(`/notebook/${notebook.id}`)}
                    >
                      查看
                    </Button>
                    <Button
                      className="booklet-card-btn secondary"
                      onClick={() => router.push(`/notebook/${notebook.id}/edit`)}
                    >
                      编辑
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {/* 新建小册子按钮 */}
            <Card
              className="booklet-card"
              onClick={() => router.push("/notebook/create")}
              style={{ cursor: 'pointer' }}
            >
              <div className="booklet-cover" style={{ backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardTitle className="booklet-card-title" style={{ fontSize: '2rem' }}>+</CardTitle>
              </div>
              <CardContent className="booklet-card-content">
                <CardDescription className="booklet-card-desc">新建小册子</CardDescription>
                <div className="booklet-card-meta">
                  <span></span>
                  <span></span>
                </div>
                <Button className="booklet-card-btn">
                  创建
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* FAB */}
      <div className="fab-container">
        <Button
          className="fab"
          onClick={() => router.push("/note/create")}
        >
          +
        </Button>
      </div>

      {/* Navigation buttons */}
      <div style={{ position: 'fixed', bottom: '2rem', left: '2rem', display: 'flex', gap: '1rem', zIndex: 99 }}>
        <Button
          className="home-btn"
          onClick={() => router.push("/")}
        >
          首页
        </Button>
        <Button
          className="go-to-notes"
          onClick={() => router.push("/notes")}
        >
          笔记列表 →
        </Button>
      </div>
    </div>
  );
}