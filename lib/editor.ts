import { Extension, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { isValidImageUrl, isValidLinkUrl } from "@/lib/xss-protection";

// 安全的图片扩展
export const SafeImageExtension = Extension.create({
  name: "safeImage",

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  addNodeView() {
    return {
      dom: document.createElement("img"),
      update: (node, { editor }) => {
        const img = this.dom as HTMLImageElement;
        img.src = node.attrs.src || "";
        img.alt = node.attrs.alt || "";
        img.title = node.attrs.title || "";

        // 验证图片 URL
        if (!isValidImageUrl(node.attrs.src)) {
          img.src = "";
          img.alt = "无效的图片 URL";
        }
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(HTMLAttributes, {
        src: node.attrs.src,
        alt: node.attrs.alt,
        title: node.attrs.title,
      }),
    ];
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (dom) => {
          const img = dom as HTMLImageElement;
          return {
            src: img.src,
            alt: img.alt,
            title: img.title,
          };
        },
      },
    ];
  },
});

// 安全的链接扩展
export const SafeLinkExtension = Extension.create({
  name: "safeLink",

  addAttributes() {
    return {
      href: {
        default: null,
      },
      target: {
        default: null,
      },
      rel: {
        default: null,
      },
    };
  },

  addNodeView() {
    return {
      dom: document.createElement("a"),
      update: (node, { editor }) => {
        const a = this.dom as HTMLAnchorElement;
        a.href = node.attrs.href || "#";
        a.target = node.attrs.target || "_self";
        a.rel = node.attrs.rel || "noopener noreferrer";

        // 验证链接 URL
        if (!isValidLinkUrl(node.attrs.href)) {
          a.href = "#";
          a.textContent = "无效的链接";
        }
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        href: node.attrs.href,
        target: node.attrs.target,
        rel: node.attrs.rel,
      }),
      0,
    ];
  },

  parseHTML() {
    return [
      {
        tag: "a[href]",
        getAttrs: (dom) => {
          const a = dom as HTMLAnchorElement;
          return {
            href: a.href,
            target: a.target,
            rel: a.rel,
          };
        },
      },
    ];
  },
});

// 撤销/重做扩展
export const HistoryExtension = Extension.create({
  name: "history",

  addCommands() {
    return {
      undo: () => ({ state, dispatch }) => {
        return dispatch(state.tr.undo());
      },
      redo: () => ({ state, dispatch }) => {
        return dispatch(state.tr.redo());
      },
    };
  },
});

// 快捷键扩展
export const KeyboardShortcutsExtension = Extension.create({
  name: "keyboardShortcuts",

  addKeyboardShortcuts() {
    return {
      "Mod-z": () => this.editor.commands.undo(),
      "Mod-Shift-z": () => this.editor.commands.redo(),
      "Mod-y": () => this.editor.commands.redo(),
      "Mod-b": () => this.editor.commands.toggleBold(),
      "Mod-i": () => this.editor.commands.toggleItalic(),
      "Mod-u": () => this.editor.commands.toggleUnderline(),
      "Mod-Shift-b": () => this.editor.commands.toggleBold(),
      "Mod-Shift-i": () => this.editor.commands.toggleItalic(),
      "Mod-Shift-u": () => this.editor.commands.toggleUnderline(),
      "Mod-Shift-l": () => this.editor.commands.toggleBulletList(),
      "Mod-Shift-d": () => this.editor.commands.toggleOrderedList(),
      "Mod-Shift-h": () => this.editor.commands.toggleHeading({ level: 1 }),
      "Mod-Shift-e": () => this.editor.commands.toggleHeading({ level: 2 }),
      "Mod-Shift-r": () => this.editor.commands.toggleHeading({ level: 3 }),
    };
  },
});

export const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
    codeBlock: false,
    horizontalRule: {
      HTMLAttributes: {
        class: "my-8 border-t border-border",
      },
    },
  }),
  SafeImageExtension,
  SafeLinkExtension,
  HistoryExtension,
  KeyboardShortcutsExtension,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-accent underline underline-offset-2 hover:text-accent/80",
    },
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") {
        return "标题";
      }
      return "开始写作...";
    },
    emptyEditorClass: "is-editor-empty",
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Typography,
  Underline,
  Highlight.configure({
    multicolor: true,
  }),
];

export const editorShortcuts: Record<string, string> = {
  "Mod-b": "toggleBold",
  "Mod-i": "toggleItalic",
  "Mod-u": "toggleUnderline",
  "Mod-Shift-s": "toggleStrike",
  "Mod-h": "toggleHighlight",
  "Mod-Shift-7": "toggleOrderedList",
  "Mod-Shift-8": "toggleBulletList",
  "Mod-Shift-b": "toggleBlockquote",
  "Mod-Shift-9": "setHorizontalRule",
  "Mod-Alt-1": "toggleHeading",
  "Mod-Alt-2": "toggleHeading",
  "Mod-Alt-3": "toggleHeading",
  "Mod-l": "setTextAlign:left",
  "Mod-e": "setTextAlign:center",
  "Mod-r": "setTextAlign:right",
  "Mod-k": "toggleLink",
  "Mod-p": "setImage",
  "Mod-z": "undo",
  "Mod-Shift-z": "redo",
  "Mod-y": "redo",
};

export const markdownShortcuts = Extension.create({
  name: "markdownShortcuts",
  addKeyboardShortcuts() {
    return {
      Space: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;
        const textBefore = $from.nodeBefore?.text || "";

        // Heading shortcuts
        if (textBefore === "#") {
          editor
            .chain()
            .deleteRange({ from: $from.pos - 1, to: $from.pos })
            .setHeading({ level: 1 })
            .run();
          return true;
        }
        if (textBefore === "##") {
          editor
            .chain()
            .deleteRange({ from: $from.pos - 2, to: $from.pos })
            .setHeading({ level: 2 })
            .run();
          return true;
        }
        if (textBefore === "###") {
          editor
            .chain()
            .deleteRange({ from: $from.pos - 3, to: $from.pos })
            .setHeading({ level: 3 })
            .run();
          return true;
        }

        // List shortcuts
        if (textBefore === "-" || textBefore === "*") {
          editor
            .chain()
            .deleteRange({ from: $from.pos - 1, to: $from.pos })
            .toggleBulletList()
            .run();
          return true;
        }
        if (/^\d+\.$/.test(textBefore)) {
          const length = textBefore.length;
          editor
            .chain()
            .deleteRange({ from: $from.pos - length, to: $from.pos })
            .toggleOrderedList()
            .run();
          return true;
        }

        // Blockquote
        if (textBefore === ">") {
          editor
            .chain()
            .deleteRange({ from: $from.pos - 1, to: $from.pos })
            .toggleBlockquote()
            .run();
          return true;
        }

        // Divider
        if (textBefore === "---" || textBefore === "***") {
          const length = textBefore.length;
          editor
            .chain()
            .deleteRange({ from: $from.pos - length, to: $from.pos })
            .setHorizontalRule()
            .run();
          return true;
        }

        return false;
      },
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;
        const node = $from.parent;

        // Exit blockquote on double enter
        if (node.type.name === "blockquote" && node.textContent === "") {
          editor.chain().liftEmptyBlock().run();
          return true;
        }

        return false;
      },
    };
  },
});

export const wordCountExtension = Extension.create({
  name: "wordCount",
  addStorage() {
    return {
      wordCount: 0,
      characterCount: 0,
    };
  },
  onUpdate() {
    const text = this.editor.getText();
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    this.storage.wordCount = words.length;
    this.storage.characterCount = text.length;
  },
});
