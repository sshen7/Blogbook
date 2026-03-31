import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
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

    // 暂时返回模拟数据
    if (noteId) {
      // 模拟单个笔记
      const mockNote = {
        id: noteId,
        title: "示例笔记",
        content: "<p>这是一条示例笔记内容</p>",
        contentPlain: "这是一条示例笔记内容",
        wordCount: 10,
        theme: "minimal",
        isDraft: false,
        notebookId: notebookId || "1",
        userId,
        tags: [],
        notebook: null,
        _count: {
          images: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json(mockNote);
    } else {
      // 模拟笔记列表
      const mockNotes = [
        {
          id: "note_1",
          title: "个人日记 - 第一天",
          content: "<p>今天是开始写日记的第一天，希望能坚持下去。</p>",
          contentPlain: "今天是开始写日记的第一天，希望能坚持下去。",
          wordCount: 15,
          theme: "minimal",
          isDraft: false,
          notebookId: "1",
          userId,
          tags: [],
          notebook: null,
          _count: {
            images: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "note_2",
          title: "个人日记 - 第二天",
          content: "<p>今天天气很好，出去散步了。</p>",
          contentPlain: "今天天气很好，出去散步了。",
          wordCount: 10,
          theme: "minimal",
          isDraft: false,
          notebookId: "1",
          userId,
          tags: [],
          notebook: null,
          _count: {
            images: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "note_3",
          title: "工作笔记 - 项目计划",
          content: "<p>下周项目启动，需要准备相关材料。</p>",
          contentPlain: "下周项目启动，需要准备相关材料。",
          wordCount: 12,
          theme: "minimal",
          isDraft: false,
          notebookId: "2",
          userId,
          tags: [],
          notebook: null,
          _count: {
            images: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "note_4",
          title: "学习资料 - 编程笔记",
          content: "<p>今天学习了新的编程技巧。</p>",
          contentPlain: "今天学习了新的编程技巧。",
          wordCount: 10,
          theme: "minimal",
          isDraft: false,
          notebookId: "3",
          userId,
          tags: [],
          notebook: null,
          _count: {
            images: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // 如果指定了笔记本ID，只返回该笔记本的笔记
      if (notebookId) {
        const filteredNotes = mockNotes.filter(note => note.notebookId === notebookId);
        return NextResponse.json(filteredNotes);
      }

      return NextResponse.json(mockNotes);
    }
  } catch (error) {
    console.error("获取笔记失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
