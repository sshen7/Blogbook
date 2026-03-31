"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Tag,
  FileText,
  Search,
} from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  color: string;
  usageCount: number;
  _count: {
    notes: number;
  };
}

const presetColors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#78716c",
  "#52525b",
];

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) throw new Error("获取失败");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      toast.error("获取标签失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTagName.trim()) {
      toast.error("请输入标签名称");
      return;
    }

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "创建失败");
      }

      toast.success("标签创建成功");
      setNewTagName("");
      setNewTagColor("#3b82f6");
      setIsCreateDialogOpen(false);
      fetchTags();
    } catch (error: any) {
      toast.error(error.message || "创建失败");
    }
  };

  const handleUpdate = async () => {
    if (!editingTag || !newTagName.trim()) {
      toast.error("请输入标签名称");
      return;
    }

    try {
      const response = await fetch("/api/tags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTag.id,
          name: newTagName.trim(),
          color: newTagColor,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "更新失败");
      }

      toast.success("标签更新成功");
      setEditingTag(null);
      setNewTagName("");
      setNewTagColor("#3b82f6");
      fetchTags();
    } catch (error: any) {
      toast.error(error.message || "更新失败");
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm("确定要删除这个标签吗？关联的笔记将取消该标签。")) return;

    try {
      const response = await fetch(`/api/tags?id=${tagId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("删除失败");

      toast.success("标签已删除");
      fetchTags();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const openEditDialog = (tag: TagItem) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
    setIsCreateDialogOpen(true);
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingTag(null);
    setNewTagName("");
    setNewTagColor("#3b82f6");
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">标签管理</h1>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新建标签
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTag ? "编辑标签" : "新建标签"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="tagName">标签名称</Label>
                  <Input
                    id="tagName"
                    placeholder="输入标签名称"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>选择颜色</Label>
                  <div className="grid grid-cols-9 gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTagColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          newTagColor === color
                            ? "border-foreground scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={closeDialog}>
                    取消
                  </Button>
                  <Button
                    onClick={editingTag ? handleUpdate : handleCreate}
                    disabled={!newTagName.trim()}
                  >
                    {editingTag ? "保存" : "创建"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto py-8 px-4">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredTags.length === 0 ? (
          <EmptyState
            title={searchQuery ? "未找到标签" : "还没有标签"}
            description={
              searchQuery
                ? "尝试其他关键词搜索"
                : "创建标签来分类你的笔记"
            }
            action={
              !searchQuery && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建标签
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-3">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div>
                    <h3 className="font-medium">{tag.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      <FileText className="h-3 w-3 inline mr-1" />
                      {tag._count.notes} 篇笔记
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link href={`/notes?tagId=${tag.id}`}>
                      查看笔记
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                        <Edit className="h-4 w-4 mr-2" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(tag.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
