import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

    // 暂时返回模拟数据，避免数据库连接问题
    const mockNote = {
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

    return NextResponse.json(mockNote, { status: 201 });
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

    // 返回空数组，避免显示测试笔记
    if (noteId) {
      // 找不到笔记时返回404
      return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
    } else {
      // 返回空数组，不显示测试笔记
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("获取笔记失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
