import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  notebookId: z.string().optional().nullable(),
  theme: z.string().optional(),
  isDraft: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 暂时返回模拟数据
    const mockNote = {
      id: params.id,
      title: "示例笔记",
      content: "<p>这是一条示例笔记内容</p>",
      contentPlain: "这是一条示例笔记内容",
      wordCount: 10,
      theme: "minimal",
      isDraft: false,
      notebookId: "1",
      userId: "1",
      tags: [],
      notebook: {
        id: "1",
        title: "我的旅行笔记"
      },
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockNote);
  } catch (error) {
    console.error("获取笔记失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validatedData = updateNoteSchema.parse(body);

    // 暂时返回模拟数据
    const updatedNote = {
      id: params.id,
      title: validatedData.title || "示例笔记",
      content: validatedData.content || "<p>这是一条示例笔记内容</p>",
      contentPlain: (validatedData.content || "这是一条示例笔记内容").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(),
      wordCount: 10,
      theme: validatedData.theme || "minimal",
      isDraft: validatedData.isDraft || false,
      isStarred: validatedData.isStarred || false,
      notebookId: validatedData.notebookId || "1",
      userId: "1",
      tags: [],
      notebook: {
        id: "1",
        title: "我的旅行笔记"
      },
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 暂时返回成功响应
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除笔记失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
