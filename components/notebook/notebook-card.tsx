"use client";

import { FileText } from "lucide-react";

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  coverType: string;
  coverValue: string;
  theme: string;
  _count: {
    notes: number;
  };
}

interface NotebookCardProps {
  notebook: Notebook;
}

export function NotebookCard({ notebook }: NotebookCardProps) {
  const getCoverStyle = () => {
    switch (notebook.coverType) {
      case "color":
        return { backgroundColor: notebook.coverValue };
      case "image":
        return {
          backgroundImage: `url(${notebook.coverValue})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        };
      default:
        return { backgroundColor: "#f5f5f5" };
    }
  };

  return (
    <div className="group cursor-pointer">
      <div
        className="aspect-[3/4] rounded-lg shadow-sm border border-border/50 overflow-hidden transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1"
        style={getCoverStyle()}
      >
        <div className="h-full w-full p-4 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/10">
          <div className="flex-1" />
          <div className="text-white drop-shadow-md">
            <h3 className="font-semibold text-lg line-clamp-2">
              {notebook.title}
            </h3>
            {notebook.description && (
              <p className="text-sm text-white/80 line-clamp-1 mt-1">
                {notebook.description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-sm font-medium text-foreground line-clamp-1">
          {notebook.title}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="w-3 h-3" />
          <span>{notebook._count.notes}</span>
        </div>
      </div>
    </div>
  );
}
