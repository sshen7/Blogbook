"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { editorThemes } from "@/lib/themes";
import { toast } from "sonner";
import { ArrowLeft, Palette, Type, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

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

export default function CreateNotebookPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverType, setCoverType] = useState<"color" | "image"> ("color");
  const [coverValue, setCoverValue] = useState("#f5f5f5");
  const [theme, setTheme] = useState("minimal");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("请输入小册子名称");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/notebooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          coverType,
          coverValue,
          theme,
        }),
      });

      if (!response.ok) {
        throw new Error("创建失败");
      }

      const notebook = await response.json();
      toast.success("小册子创建成功");
      router.push(`/notebook/${notebook.id}`);
    } catch (error) {
      toast.error("创建失败，请重试");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="create-booklet-page">
      {/* 顶部导航 */}
      <div className="page-header">
        <button className="back-btn" onClick={() => router.push("/bookshelf")}>←</button>
        <h1>新建小册子</h1>
      </div>

      {/* 内容 */}
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 基本信息卡片 */}
        <div className="form-card">
          <h3>基本信息</h3>
          <div className="form-row">
            <label htmlFor="title">名称</label>
            <Input
              id="title"
              placeholder="给小册子起个名字"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="form-row">
            <label htmlFor="description">简介（可选）</label>
            <Textarea
              id="description"
              placeholder="简单描述一下这个小册子..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

        {/* 创建按钮（直接贴在封面卡片下方） */}
        <div className="create-btn-bar">
          <button 
            className="create-btn" 
            onClick={handleCreate} 
            disabled={isCreating}
          >
            {isCreating ? "创建中..." : "创建"}
          </button>
        </div>
      </div>
    </div>
  );
}
