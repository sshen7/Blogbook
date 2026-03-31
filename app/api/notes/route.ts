import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { memoryStorage } from "@/lib/memory-storage";

const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().default(""),
  notebookId: z.string().optional(),
  theme: z.string().default("minimal"),
  isDraft: z.boolean().default(false),
  tagIds: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 暂时允许未登录用户创建笔记
    const userId = "1";

    const body = await req.json();
    const validatedData = createNoteSchema.parse(body);

    // Extract plain text for search
    const contentPlain = validatedData.content
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Count words (Chinese characters count as words)
    const wordCount = contentPlain.length;

    // 创建新笔记
    const newNote = {
      id: `note_${Date.now()}`,
      title: validatedData.title,
      content: validatedData.content,
      contentPlain,
      wordCount,
      theme: validatedData.theme,
      isDraft: validatedData.isDraft,
      notebookId: validatedData.notebookId,
      userId,
      tags: [],
      notebook: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 存储到内存中
    memoryStorage.notes.create(newNote);

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      );
    }

    console.error("创建笔记失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // 暂时允许未登录用户获取笔记
    const userId = "1";

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("id");
    const notebookId = searchParams.get("notebookId");

    if (noteId) {
      // 查找指定的笔记
      const note = memoryStorage.notes.get(noteId);
      if (!note) {
        return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
      }
      return NextResponse.json(note);
    } else if (notebookId) {
      // 查找指定小册子的笔记
      const filteredNotes = memoryStorage.notes.get(undefined, notebookId);
      return NextResponse.json(filteredNotes);
    } else {
      // 返回所有笔记
      const allNotes = memoryStorage.notes.get();
      return NextResponse.json(allNotes);
    }
  } catch (error) {
    console.error("获取笔记失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // 暂时允许未登录用户更新笔记
    const userId = "1";

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("id");

    if (!noteId) {
      return NextResponse.json({ error: "缺少笔记ID" }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = createNoteSchema.partial().parse(body);

    // 查找要更新的笔记
    const existingNote = memoryStorage.notes.get(noteId);
    if (!existingNote) {
      return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
    }

    // 提取纯文本用于搜索
    const contentPlain = validatedData.content
      ? validatedData.content
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim()
      : existingNote.contentPlain;

    // 计算字数（中文字符计为单词）
    const wordCount = contentPlain.length;

    // 更新笔记
    const updatedNote = {
      ...existingNote,
      ...validatedData,
      contentPlain,
      wordCount,
      updatedAt: new Date().toISOString(),
    };

    // 保存更新
    const result = memoryStorage.notes.update(noteId, updatedNote);
    if (!result) {
      return NextResponse.json({ error: "更新失败" }, { status: 500 });
    }

    return NextResponse.json(updatedNote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      );
    }

    console.error("更新笔记失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 暂时允许未登录用户删除笔记
    const userId = "1";

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("id");

    if (!noteId) {
      return NextResponse.json({ error: "缺少笔记ID" }, { status: 400 });
    }

    // 删除笔记
    const success = memoryStorage.notes.delete(noteId);
    if (!success) {
      return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
    }

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除笔记失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
