"use client";

import { useEffect, useCallback } from "react";
import { useEditor, EditorContent, BubbleMenu, type Editor as TiptapEditor } from "@tiptap/react";
import { editorExtensions, markdownShortcuts, wordCountExtension } from "@/lib/editor";
import { generateThemeStyles, getThemeById } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "./editor-toolbar";
import { EditorBubbleMenu } from "./editor-bubble-menu";
import { sanitizeHtml, extractPlainText, validateRichText, isValidImageUrl } from "@/lib/xss-protection";

interface EditorProps {
  content?: string;
  theme?: string;
  onChange?: (content: string) => void;
  onWordCountChange?: (count: { words: number; characters: number }) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
  showBubbleMenu?: boolean;
}

export function Editor({
  content = "",
  theme = "minimal",
  onChange,
  onWordCountChange,
  editable = true,
  placeholder,
  className,
  showToolbar = true,
  showBubbleMenu = false,
}: EditorProps) {
  const currentTheme = getThemeById(theme);

  const addImage = () => {
    const url = window.prompt("输入图片地址");
    if (url && editor && isValidImageUrl(url)) {
      editor.chain().focus().setImage({ src: url }).run();
    } else if (url) {
      alert("无效的图片 URL");
    }
  };

  const editor = useEditor({
    extensions: [...editorExtensions, markdownShortcuts, wordCountExtension],
    content: sanitizeHtml(content),
    editable,
    immediatelyRender: true,
    onUpdate: useCallback(
      ({ editor }: { editor: TiptapEditor }) => {
        const html = sanitizeHtml(editor.getHTML());
        onChange?.(html);

        const text = extractPlainText(html);
        const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
        onWordCountChange?.({
          words: words.length,
          characters: text.length,
        });
      },
      [onChange, onWordCountChange]
    ),
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-lg max-w-none focus:outline-none min-h-[300px] px-8 py-12 border-none",
          `editor-theme-${theme}`
        ),
        style: 'border: none; outline: none;'
      },
      handleKeyDown: (view, event) => {
        // 处理自定义快捷键
        const { state } = view;
        const { selection } = state;
        const { empty } = selection;

        // 检查是否按下了快捷键
        if (event.ctrlKey || event.metaKey) {
          switch (event.key.toLowerCase()) {
            case 'h':
              if (!event.shiftKey && !event.altKey) {
                event.preventDefault();
                view.dispatch(view.state.tr.setMeta('command', 'toggleHighlight'));
                return true;
              }
              break;
            case 'l':
              if (!event.shiftKey && !event.altKey) {
                event.preventDefault();
                view.dispatch(view.state.tr.setMeta('command', 'setTextAlign:left'));
                return true;
              }
              break;
            case 'e':
              if (!event.shiftKey && !event.altKey) {
                event.preventDefault();
                view.dispatch(view.state.tr.setMeta('command', 'setTextAlign:center'));
                return true;
              }
              break;
            case 'r':
              if (!event.shiftKey && !event.altKey) {
                event.preventDefault();
                view.dispatch(view.state.tr.setMeta('command', 'setTextAlign:right'));
                return true;
              }
              break;
            case 'p':
              if (!event.shiftKey && !event.altKey) {
                event.preventDefault();
                addImage();
                return true;
              }
              break;
          }
        }

        return false;
      },
    },
  });

  // Inject theme styles
  useEffect(() => {
    const styleId = `editor-theme-${theme}-styles`;
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

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative",
        className
      )}
    >
      {editable && showToolbar && (
        <div style={{ backgroundColor: '#f8f5f0' }}>
          <EditorToolbar editor={editor} />
        </div>
      )}

      {editable && showBubbleMenu && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-popover border rounded-lg shadow-lg p-1"
        >
          <EditorBubbleMenu editor={editor} />
        </BubbleMenu>
      )}

      <EditorContent
        editor={editor}
        className="focus:outline-none border-none"
        style={{ backgroundColor: '#fff', color: '#2d2d2d', minHeight: '300px', padding: '1rem', border: 'none', outline: 'none' }}
      />
    </div>
  );
}
