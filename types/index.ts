import { User, Notebook, Note, Tag, Image, Template } from "@prisma/client";

export type { User, Notebook, Note, Tag, Image, Template };

export interface NotebookWithCount extends Notebook {
  _count: {
    notes: number;
  };
}

export interface NoteWithTags extends Note {
  tags: Tag[];
  notebook: Notebook | null;
}

export interface EditorTheme {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  headingStyle: "serif" | "sans" | "kai";
  paragraphSpacing: "compact" | "normal" | "relaxed";
  colors: {
    background: string;
    text: string;
    accent: string;
  };
}

export interface ImageFilter {
  id: string;
  name: string;
  filter: string;
}

export interface ExportOptions {
  format: "pdf" | "markdown" | "txt";
  includeImages: boolean;
  includeTOC: boolean;
}
