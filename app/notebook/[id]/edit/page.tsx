"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { editorThemes } from "@/lib/themes";

const presetColors = [
  "#f5f5f5",
  "#e8e4df",
  "#d4e4d1",
  "#d1e4e4",
  "#d1d4e4",
  "#e4d1e4",
  "#e4d1d1",
  "#f4ecd8",
  "#2c3e50",
  "#8b7355",
  "#5b8a72",
  "#7b6b5d",
];

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  coverType: string;
  coverValue: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditNotebookPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverType, setCoverType] = useState<"color" | "image"> ("color");
  const [coverValue, setCoverValue] = useState("#f5f5f5");
  const [theme, setTheme] = useState("minimal");

  useEffect(() => {
    fetchNotebook();
  }, [params.id]);

  const fetchNotebook = async () => {
    try {
      const response = await fetch(`/api/notebooks?id=${params.id}`);
      if (!response.ok) throw new Error("获取失败");
      const data = await response.json();
      setNotebook(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setCoverType(data.coverType === "image" ? "image" : "color");
      setCoverValue(data.coverValue);
      setTheme(data.theme);
    } catch (error) {
      toast.error("获取小册子失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("请输入标题");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/notebooks?id=${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          coverType,
          coverValue,
          theme,
        }),
      });

      if (!response.ok) throw new Error("保存失败");

      toast.success("保存成功");
      router.push(`/notebook/${params.id}`);
    } catch (error) {
      toast.error("保存失败");
    } finally {
      setIsSaving(false);
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

  return (
    <div className="create-booklet-page">
      {/* 顶部导航 */}
      <div className="page-header">
        <button 
          className="back-btn"
          onClick={() => router.push(`/notebook/${params.id}`)}
        >
          ←
        </button>
        <h1>编辑小册子</h1>
      </div>

      {/* 内容 */}
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 基本信息卡片 */}
        <div className="form-card">
          <h3>基本信息</h3>
          <div className="form-row">
            <label htmlFor="title">名称</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给小册子起个名字"
              className="h-11"
            />
          </div>
          <div className="form-row">
            <label htmlFor="description">简介（可选）</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简单描述一下这个小册子..."
              rows={3}
            />
          </div>
        </div>

        {/* 封面设置卡片 */}
        <div className="form-card">
          <h3>封面设置</h3>
          <div className="form-row">
            <label>封面类型</label>
            <div className="cover-type-toggle">
              <button
                type="button"
                className={`toggle-btn ${coverType === "color" ? "active" : ""}`}
                onClick={() => setCoverType("color")}
              >
                纯色
              </button>
              <button
                type="button"
                className={`toggle-btn ${coverType === "image" ? "active" : ""}`}
                onClick={() => setCoverType("image")}
              >
                图片
              </button>
            </div>
          </div>

          {coverType === "color" && (
            <div className="form-row">
              <label>选择颜色</label>
              <div className="color-picker">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCoverValue(color)}
                    className={`color-btn ${coverValue === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {coverType === "image" && (
            <div className="form-row">
              <label>上传图片</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const result = event.target?.result;
                      if (typeof result === 'string') {
                        setCoverValue(result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          )}

          <div className="form-row">
            <label>预览</label>
            <div className="preview-card">
              <div
                className="aspect-[3/4] max-w-[200px] rounded-lg shadow-sm border overflow-hidden mb-2"
                style={
                  coverType === "color"
                    ? { backgroundColor: coverValue }
                    : {
                        backgroundImage: `url(${coverValue})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                }
              >
                <div className="h-full w-full p-4 flex flex-col justify-end bg-gradient-to-b from-transparent to-black/30">
                  <h3 className="preview-title text-white drop-shadow-md">
                    {title || "小册子名称"}
                  </h3>
                  {description && (
                    <p className="preview-desc text-white/80 line-clamp-2 drop-shadow-md">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部创建按钮 */}
        <div className="create-btn-bar">
          <button 
            className="create-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
