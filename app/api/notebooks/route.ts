import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createNotebookSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  coverType: z.enum(["color", "image", "template"]).default("color"),
  coverValue: z.string().default("#f5f5f5"),
  theme: z.string().default("minimal"),
});

// 使用全局对象存储模拟数据，以便与[id]端点共享
if (!global.mockNotebooks) {
  global.mockNotebooks = [
    {
      id: "1",
      title: "个人日记",
      description: "记录生活中的点点滴滴",
      coverType: "color",
      coverValue: "#4f46e5",
      theme: "minimal",
      sortOrder: 1,
      userId: "1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      _count: {
        notes: 3
      }
    },
    {
      id: "2",
      title: "工作笔记",
      description: "工作相关的笔记和计划",
      coverType: "color",
      coverValue: "#10b981",
      theme: "minimal",
      sortOrder: 2,
      userId: "1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      _count: {
        notes: 5
      }
    },
    {
      id: "3",
      title: "学习资料",
      description: "各种学习资源和笔记",
      coverType: "color",
      coverValue: "#f59e0b",
      theme: "minimal",
      sortOrder: 3,
      userId: "1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      _count: {
        notes: 2
      }
    }
  ];
  global.nextId = 4;
}

// 模拟数据
let mockNotebooks = global.mockNotebooks;
let nextId = global.nextId;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createNotebookSchema.parse(body);

    const newNotebook = {
      id: nextId.toString(),
      title: validatedData.title,
      description: validatedData.description,
      coverType: validatedData.coverType,
      coverValue: validatedData.coverValue,
      theme: validatedData.theme,
      sortOrder: mockNotebooks.length + 1,
      userId: "1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      _count: {
        notes: 0
      }
    };

    mockNotebooks.push(newNotebook);
    nextId++;

    return NextResponse.json(newNotebook, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      );
    }

    console.error("创建小册子失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // 返回模拟数据
    return NextResponse.json(mockNotebooks);
  } catch (error) {
    console.error("获取小册子失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "缺少ID" }, { status: 400 });
    }

    const index = mockNotebooks.findIndex(note => note.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    mockNotebooks[index] = {
      ...mockNotebooks[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(mockNotebooks[index]);
  } catch (error) {
    console.error("更新小册子失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少ID" }, { status: 400 });
    }

    const index = mockNotebooks.findIndex(note => note.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    mockNotebooks.splice(index, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除小册子失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
