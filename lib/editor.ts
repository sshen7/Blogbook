import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";

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
  Image.configure({
    allowBase64: true,
    HTMLAttributes: {
      class: "rounded-lg max-w-full h-auto",
    },
  }),
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
