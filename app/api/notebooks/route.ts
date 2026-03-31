import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { memoryStorage } from "@/lib/memory-storage";

const createNotebookSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  coverType: z.enum(["color", "image", "template"]).default("color"),
  coverValue: z.string().default("#f5f5f5"),
  theme: z.string().default("minimal"),
});

// 创建笔记本
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createNotebookSchema.parse(body);

    const newNotebook = {
      id: `notebook_${Date.now()}`,
      title: validatedData.title,
      description: validatedData.description,
      coverType: validatedData.coverType,
      coverValue: validatedData.coverValue,
      theme: validatedData.theme,
      sortOrder: 0,
      userId: "1",
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { notes: 0 }
    };

    // 存储到内存中
    memoryStorage.notebooks.create(newNotebook);

    return NextResponse.json(newNotebook, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      );
    }

    console.error("创建笔记本失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

// 获取所有笔记本或单个笔记本
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // 获取单个笔记本
      const notebook = memoryStorage.notebooks.get(id);
      if (!notebook) {
        return NextResponse.json({ error: "笔记本不存在" }, { status: 404 });
      }
      return NextResponse.json(notebook);
    } else {
      // 获取所有笔记本
      const filteredNotebooks = memoryStorage.notebooks.get()
        .sort((a, b) => a.sortOrder - b.sortOrder);

      return NextResponse.json(filteredNotebooks);
    }
  } catch (error) {
    console.error("获取笔记本失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 更新笔记本
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "缺少ID" }, { status: 400 });
    }

    // 查找要更新的笔记本
    const existingNotebook = memoryStorage.notebooks.get(id);
    if (!existingNotebook) {
      return NextResponse.json({ error: "笔记本不存在" }, { status: 404 });
    }

    // 更新笔记本
    const updatedNotebook = {
      ...existingNotebook,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // 保存更新
    const result = memoryStorage.notebooks.update(id, updatedNotebook);
    if (!result) {
      return NextResponse.json({ error: "更新失败" }, { status: 500 });
    }

    return NextResponse.json(updatedNotebook);
  } catch (error) {
    console.error("更新笔记本失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// 删除笔记本
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少ID" }, { status: 400 });
    }

    // 删除笔记本
    const success = memoryStorage.notebooks.delete(id);
    if (!success) {
      return NextResponse.json({ error: "笔记本不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除笔记本失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}