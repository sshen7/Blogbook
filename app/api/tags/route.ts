import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { memoryStorage } from "@/lib/memory-storage";

const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#888888"),
});

export async function POST(req: NextRequest) {
  try {
    // 暂时允许未登录用户创建标签
    const userId = "1";

    const body = await req.json();
    const validatedData = createTagSchema.parse(body);

    // Check if tag already exists for this user
    const existing = memoryStorage.tags.get(userId).find(
      (tag: any) => tag.name === validatedData.name
    );

    if (existing) {
      return NextResponse.json(
        { error: "标签已存在" },
        { status: 400 }
      );
    }

    const newTag = {
      id: `tag_${Date.now()}`,
      name: validatedData.name,
      color: validatedData.color,
      userId,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { notes: 0 }
    };

    // 存储到内存中
    memoryStorage.tags.create(newTag);

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      );
    }

    console.error("创建标签失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // 暂时允许未登录用户获取标签
    const userId = "1";

    const filteredTags = memoryStorage.tags.get(userId)
      .sort((a: any, b: any) => b.usageCount - a.usageCount);

    return NextResponse.json(filteredTags);
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // 暂时允许未登录用户更新标签
    const userId = "1";

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "缺少ID" }, { status: 400 });
    }

    // Verify ownership
    const existing = memoryStorage.tags.get(userId).find(
      (tag: any) => tag.id === id
    );

    if (!existing) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    // Check name uniqueness if updating name
    if (updateData.name && updateData.name !== existing.name) {
      const duplicate = memoryStorage.tags.get(userId).find(
        (tag: any) => tag.name === updateData.name && tag.id !== id
      );

      if (duplicate) {
        return NextResponse.json(
          { error: "标签名称已存在" },
          { status: 400 }
        );
      }
    }

    // 更新标签
    const updatedTag = {
      ...existing,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // 保存更新
    const result = memoryStorage.tags.update(id, updatedTag);
    if (!result) {
      return NextResponse.json({ error: "更新失败" }, { status: 500 });
    }

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error("更新标签失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 暂时允许未登录用户删除标签
    const userId = "1";

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少ID" }, { status: 400 });
    }

    // Verify ownership
    const existing = memoryStorage.tags.get(userId).find(
      (tag: any) => tag.id === id
    );

    if (!existing) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    // 删除标签
    const success = memoryStorage.tags.delete(id);
    if (!success) {
      return NextResponse.json({ error: "删除失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除标签失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
