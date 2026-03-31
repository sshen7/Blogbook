"use client";

import { Editor } from "@tiptap/react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("输入链接地址", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("输入图片地址");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ backgroundColor: '#f8f5f0', borderBottomColor: '#eaeaea' }}>
      {/* Text formatting */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="加粗"
        title="Ctrl+B"
        variant="default"
      >
        B
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="斜体"
        title="Ctrl+I"
        variant="default"
      >
        I
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("underline")}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        aria-label="下划线"
        title="Ctrl+U"
        variant="default"
      >
        U
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="删除线"
        title="Ctrl+Shift+S"
        variant="default"
      >
        S
      </Toggle>

      <span className="mx-1 text-gray-400">|</span>

      {/* Headings */}
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 1 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        aria-label="标题 1"
        title="Ctrl+Alt+1"
        variant="default"
      >
        H1
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        aria-label="标题 2"
        title="Ctrl+Alt+2"
        variant="default"
      >
        H2
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 3 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        aria-label="标题 3"
        title="Ctrl+Alt+3"
        variant="default"
      >
        H3
      </Toggle>

      <span className="mx-1 text-gray-400">|</span>

      {/* Lists */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() =>
          editor.chain().focus().toggleBulletList().run()
        }
        aria-label="无序列表"
        title="Ctrl+Shift+8"
        variant="default"
      >
        •
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() =>
          editor.chain().focus().toggleOrderedList().run()
        }
        aria-label="有序列表"
        title="Ctrl+Shift+7"
        variant="default"
      >
        1.
      </Toggle>

      <span className="mx-1 text-gray-400">|</span>

      {/* Alignment */}
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "left" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("left").run()
        }
        aria-label="左对齐"
        title="Ctrl+L"
        variant="default"
      >
        ←
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "center" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("center").run()
        }
        aria-label="居中"
        title="Ctrl+E"
        variant="default"
      >
        ↔
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: "right" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("right").run()
        }
        aria-label="右对齐"
        title="Ctrl+R"
        variant="default"
      >
        →
      </Toggle>

      <span className="mx-1 text-gray-400">|</span>

      {/* Block elements */}
      <Toggle
        size="sm"
        pressed={editor.isActive("blockquote")}
        onPressedChange={() =>
          editor.chain().focus().toggleBlockquote().run()
        }
        aria-label="引用"
        title="Ctrl+Shift+B"
        variant="default"
      >
        ""
      </Toggle>
      <Toggle
        size="sm"
        onPressedChange={() =>
          editor.chain().focus().setHorizontalRule().run()
        }
        aria-label="分割线"
        title="Ctrl+Shift+9"
        variant="default"
      >
        ─
      </Toggle>

      <span className="mx-1 text-gray-400">|</span>

      {/* Media */}
      <Toggle size="sm" onPressedChange={setLink} aria-label="链接" title="Ctrl+K" variant="default">
        🔗
      </Toggle>
      <Toggle size="sm" onPressedChange={addImage} aria-label="图片" title="Ctrl+P" variant="default">
        🖼️
      </Toggle>
    </div>
  );
}
