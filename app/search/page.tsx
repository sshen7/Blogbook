"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  FileText,
  BookOpen,
  Tag,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string | null;
  content: string;
  contentPlain: string;
  notebookId: string | null;
  notebookTitle: string | null;
  createdAt: string;
  updatedAt: string;
  tags: { id: string; name: string; color: string }[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/notes?search=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) throw new Error("搜索失败");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      toast.error("搜索失败");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded"
        >
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const getSnippet = (content: string, query: string, maxLength: number = 150) => {
    const plainText = content.replace(/<[^>]*>/g, "");
    const lowerQuery = query.toLowerCase();
    const index = plainText.toLowerCase().indexOf(lowerQuery);

    if (index === -1) {
      return plainText.slice(0, maxLength) + "...";
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(plainText.length, index + query.length + 100);
    let snippet = plainText.slice(start, end);

    if (start > 0) snippet = "..." + snippet;
    if (end < plainText.length) snippet = snippet + "...";

    return snippet;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索笔记..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto py-8 px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : hasSearched ? (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                找到 <span className="font-medium text-foreground">{results.length}</span> 篇笔记
                {query && (
                  <span>
                    ，关键词：
                    <span className="font-medium text-foreground">"{query}"</span>
                  </span>
                )}
              </p>
            </div>

            {results.length === 0 ? (
              <EmptyState
                title="未找到相关笔记"
                description="尝试使用其他关键词搜索"
                action={
                  <Button variant="outline" onClick={handleClear}>
                    清除搜索
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {results.map((note) => (
                  <Link key={note.id} href={`/note/${note.id}`}>
                    <div className="group p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                      {/* Title */}
                      <h3 className="font-medium text-lg mb-2 group-hover:text-accent transition-colors">
                        {query
                          ? highlightText(note.title || "无标题", query)
                          : note.title || "无标题"}
                      </h3>

                      {/* Snippet */}
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {query
                          ? highlightText(getSnippet(note.contentPlain, query), query)
                          : getSnippet(note.contentPlain, query)}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {note.notebookTitle && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {note.notebookTitle}
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(note.updatedAt)}
                        </span>

                        {note.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {note.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag.id}
                                variant="secondary"
                                className="text-xs px-1.5 py-0"
                                style={{
                                  backgroundColor: `${tag.color}20`,
                                  color: tag.color,
                                }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                            {note.tags.length > 3 && (
                              <span>+{note.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">搜索笔记</h3>
            <p className="text-muted-foreground max-w-sm">
              输入关键词搜索笔记标题和内容，支持模糊匹配
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
