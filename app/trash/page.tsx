"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface DeletedNote {
  id: string;
  title: string | null;
  content: string;
  notebookTitle: string | null;
  deletedAt: string;
  expiresAt: string;
}

export default function TrashPage() {
  const [deletedNotes, setDeletedNotes] = useState<DeletedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeletedNotes();
  }, []);

  const fetchDeletedNotes = async () => {
    try {
      const response = await fetch("/api/trash");
      if (!response.ok) throw new Error("获取失败");
      const data = await response.json();
      setDeletedNotes(data);
    } catch (error) {
      toast.error("获取回收站失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await fetch("/api/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("恢复失败");

      toast.success("笔记已恢复");
      fetchDeletedNotes();
    } catch (error) {
      toast.error("恢复失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/trash?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("删除失败");

      toast.success("笔记已永久删除");
      fetchDeletedNotes();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const response = await fetch("/api/trash", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("清空失败");

      toast.success("回收站已清空");
      fetchDeletedNotes();
    } catch (error) {
      toast.error("清空失败");
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getPlainText = (html: string) => {
    return html.replace(/<[^>]*>/g, "").slice(0, 150);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
            <div>
              <h1 className="text-lg font-semibold">回收站</h1>
              <p className="text-xs text-muted-foreground">
                {deletedNotes.length} 篇笔记 · 30天后自动删除
              </p>
            </div>
          </div>

          {deletedNotes.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  清空回收站
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    确认清空回收站？
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将永久删除回收站中的所有笔记，无法恢复。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleEmptyTrash}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    确认清空
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto py-8 px-4">
        {deletedNotes.length === 0 ? (
          <EmptyState
            title="回收站是空的"
            description="删除的笔记会在这里保留30天"
            action={
              <Button asChild>
                <Link href="/">返回书架</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {deletedNotes.map((note) => (
              <div
                key={note.id}
                className="group flex items-start gap-4 p-4 rounded-lg border bg-card"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg mb-1">
                    {note.title || "无标题"}
                  </h3>

                  {note.notebookTitle && (
                    <p className="text-sm text-muted-foreground mb-1">
                      来自：{note.notebookTitle}
                    </p>
                  )}

                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {getPlainText(note.content)}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      删除于 {formatDateTime(note.deletedAt)}
                    </span>
                    <span className="text-destructive">
                      {getDaysRemaining(note.expiresAt)} 天后永久删除
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(note.id)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    恢复
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认永久删除？</AlertDialogTitle>
                        <AlertDialogDescription>
                          此操作无法撤销，笔记将被永久删除。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(note.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          永久删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
