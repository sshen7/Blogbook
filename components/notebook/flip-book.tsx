"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit } from "lucide-react";
import Link from "next/link";
import { generateThemeStyles, getThemeById } from "@/lib/themes";

interface Note {
  id: string;
  title: string | null;
  content: string;
  order: number;
  wordCount: number;
  createdAt: string;
  tags: { id: string; name: string; color: string }[];
}

interface FlipBookProps {
  notes: Note[];
  theme: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function FlipBook({
  notes,
  theme,
  currentIndex,
  onIndexChange,
}: FlipBookProps) {
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTheme = getThemeById(theme);

  // Inject theme styles
  useEffect(() => {
    const styleId = `flipbook-theme-${theme}-styles`;
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = generateThemeStyles(currentTheme);

    return () => {
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, [theme, currentTheme]);

  const goToPage = (newIndex: number) => {
    if (isAnimating || newIndex < 0 || newIndex >= notes.length) return;

    setDirection(newIndex > currentIndex ? 1 : -1);
    setIsAnimating(true);
    onIndexChange(newIndex);

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const goNext = () => goToPage(currentIndex + 1);
  const goPrev = () => goToPage(currentIndex - 1);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isAnimating]);

  // Touch/swipe support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const currentNote = notes[currentIndex];

  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      rotateY: direction > 0 ? 90 : -90,
      opacity: 0,
    }),
    center: {
      x: 0,
      rotateY: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      rotateY: direction > 0 ? -90 : 90,
      opacity: 0,
    }),
  };

  return (
    <div className="relative">
      {/* Book Container */}
      <div
        ref={containerRef}
        className="relative mx-auto max-w-3xl"
        style={{ perspective: "1500px" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Page */}
        <div
          className="relative aspect-[3/4] md:aspect-[4/3] bg-card rounded-lg shadow-2xl overflow-hidden border"
          style={{
            transformStyle: "preserve-3d",
            backgroundColor: currentTheme.colors.background,
          }}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentNote.id}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                rotateY: { duration: 0.4, ease: "easeInOut" },
                opacity: { duration: 0.2 },
              }}
              className={`absolute inset-0 p-8 md:p-12 overflow-y-auto editor-theme-${theme}`}
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Page Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-opacity-20">
                <span className="text-sm opacity-50">
                  {currentIndex + 1} / {notes.length}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/note/${currentNote.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑
                  </Link>
                </Button>
              </div>

              {/* Page Content */}
              <article className="prose prose-lg max-w-none">
                {currentNote.title && (
                  <h1 className="text-3xl font-bold mb-6">
                    {currentNote.title}
                  </h1>
                )}
                <div
                  dangerouslySetInnerHTML={{ __html: currentNote.content }}
                  className="prose-content"
                />
              </article>

              {/* Page Footer */}
              <div className="mt-12 pt-4 border-t border-opacity-20 flex items-center justify-between text-sm opacity-50">
                <span>{currentNote.wordCount} 字</span>
                <div className="flex gap-2">
                  {currentNote.tags.map((tag) => (
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
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Page Curl Effect */}
          <div
            className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)",
              borderBottomRightRadius: "0.5rem",
            }}
          />
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={goPrev}
            disabled={currentIndex === 0 || isAnimating}
            className="rounded-full w-12 h-12"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-2">
            {notes.map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-4"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={goNext}
            disabled={currentIndex === notes.length - 1 || isAnimating}
            className="rounded-full w-12 h-12"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Quick Jump */}
        <div className="mt-4 text-center">
          <select
            value={currentIndex}
            onChange={(e) => goToPage(Number(e.target.value))}
            className="text-sm bg-transparent border-none text-muted-foreground cursor-pointer hover:text-foreground focus:outline-none"
          >
            {notes.map((note, index) => (
              <option key={note.id} value={index}>
                {index + 1}. {note.title || "无标题"}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
