import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandler } from "@/lib/api-middleware";
import { notebookService } from "@/lib/prisma-service";

const createNotebookSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  coverType: z.enum(["color", "image", "template"]).default("color"),
  coverValue: z.string().default("#f5f5f5"),
  theme: z.string().default("minimal"),
});

// 创建笔记本
export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError();
  }

  const body = await req.json();
  const validatedData = createNotebookSchema.parse(body);

  const newNotebook = await notebookService.create({
    title: validatedData.title,
    description: validatedData.description || null,
    coverType: validatedData.coverType,
    coverValue: validatedData.coverValue,
    theme: validatedData.theme,
    sortOrder: 0,
    userId: session.user.id,
    isArchived: false,
  });

  return createApiResponse(newNotebook, 201);
});

// 获取所有笔记本或单个笔记本
export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError();
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    // 获取单个笔记本
    const notebook = await notebookService.getById(id, session.user.id);
    if (!notebook) {
      throw new NotFoundError();
    }
    return createApiResponse(notebook);
  } else {
    // 获取所有笔记本
    const notebooks = await notebookService.getAll(session.user.id);
    return createApiResponse(notebooks);
  }
});

// 更新笔记本
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError();
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    throw new NotFoundError("缺少ID");
  }

  const body = await req.json();

  const updatedNotebook = await notebookService.update(id, body, session.user.id);
  if (!updatedNotebook) {
    throw new NotFoundError();
  }

  return createApiResponse(updatedNotebook);
});

// 删除笔记本
export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError();
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    throw new NotFoundError("缺少ID");
  }

  const success = await notebookService.delete(id, session.user.id);
  if (!success) {
    throw new NotFoundError();
  }

  return createApiResponse({ success: true });
});