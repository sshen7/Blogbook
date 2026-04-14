import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandler } from "@/lib/api-middleware";
import { noteService } from "@/lib/prisma-service";

const createNoteSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  content: z.string().default(""),
  notebookId: z.string().optional().nullable(),
  theme: z.string().default("minimal"),
  isDraft: z.boolean().default(false),
  tagIds: z.array(z.string()).optional(),
});

// 创建笔记
export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError();
  }

  const body = await req.json();
  const validatedData = createNoteSchema.parse(body);

  // Extract plain text for search
  const contentPlain = validatedData.content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Count words (Chinese characters count as words)
  const wordCount = contentPlain.length;

  const newNote = await noteService.create({
    title: validatedData.title,
    content: validatedData.content,
    contentPlain,
    wordCount,
    theme: validatedData.theme,
    isDraft: validatedData.isDraft,
    notebookId: validatedData.notebookId,
    userId: session.user.id,
  });

  return createApiResponse(newNote, 201);
});

// 获取所有笔记或单个笔记
export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError();
  }

  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get("id");
  const notebookId = searchParams.get("notebookId");

  if (noteId) {
    // 查找指定的笔记
    const note = await noteService.getById(noteId, session.user.id);
    if (!note) {
      throw new NotFoundError();
    }
    return createApiResponse(note);
  } else if (notebookId) {
    // 查找指定小册子的笔记
    const filteredNotes = await noteService.getByNotebookId(notebookId, session.user.id);
    return createApiResponse(filteredNotes);
  } else {
    // 返回所有笔记
    const allNotes = await noteService.getAll(session.user.id);
    return createApiResponse(allNotes);
  }
});

// 更新笔记
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError();
  }

  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get("id");

  if (!noteId) {
    throw new NotFoundError("缺少笔记ID");
  }

  const body = await req.json();
  const validatedData = createNoteSchema.partial().parse(body);

  // 提取纯文本用于搜索
  const contentPlain = validatedData.content
    ? validatedData.content
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim()
    : undefined;

  // 计算字数（中文字符计为单词）
  const wordCount = contentPlain ? contentPlain.length : undefined;

  const updatedNote = await noteService.update(
    noteId,
    {
      ...validatedData,
      contentPlain,
      wordCount,
    },
    session.user.id
  );

  if (!updatedNote) {
    throw new NotFoundError();
  }

  return createApiResponse(updatedNote);
});

// 删除笔记
export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError();
  }

  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get("id");

  if (!noteId) {
    throw new NotFoundError("缺少笔记ID");
  }

  const success = await noteService.delete(noteId, session.user.id);
  if (!success) {
    throw new NotFoundError();
  }

  return createApiResponse({ message: "删除成功" });
});