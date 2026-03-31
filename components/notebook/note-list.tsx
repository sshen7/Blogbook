"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  MoreVertical,
  Star,
  FileText,
  Image as ImageIcon,
  Edit,
  Trash2,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

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

interface NoteListProps {
  notes: Note[];
  notebookId: string;
  onRefresh: () => void;
}

export function NoteList({ notes, notebookId, onRefresh }: NoteListProps) {
  const handleStar = async (noteId: string, isStarred: boolean) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: !isStarred }),
      });

      if (!response.ok) throw new Error("操作失败");

      toast.success(isStarred ? "已取消星标" : "已添加星标");
      onRefresh();
    } catch (error) {
      toast.error("操作失败");
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("确定要删除这篇笔记吗？")) return;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("删除失败");

      toast.success("笔记已删除");
      onRefresh();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const getPlainText = (html: string) => {
    return html.replace(/<[^>]*>/g, "").slice(0, 150);
  };

  return (
    <div className="space-y-4">
      {notes.map((note, index) => (
        <div
          key={note.id}
          className="group flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
        >
          {/* Order Number */}
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
            {index + 1}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Link href={`/note/${note.id}`}>
              <h3 className="font-medium text-lg mb-1 group-hover:text-accent transition-colors">
                {note.title || "无标题"}
              </h3>
            </Link>

            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {getPlainText(note.content)}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {note.wordCount} 字
              </span>
              {note._count.images > 0 && (
                <span className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  {note._count.images} 图
                </span>
              )}
              {note.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span>+{note.tags.length - 3}</span>
                  )}
                </div>
              )}
              <span>{formatDateTime(note.updatedAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className={note.isStarred ? "text-yellow-500" : ""}
              onClick={() => handleStar(note.id, note.isStarred)}
            >
              <Star
                className={`h-4 w-4 ${
                  note.isStarred ? "fill-current" : ""
                }`}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/note/${note.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(note.id)}
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
  );
}
