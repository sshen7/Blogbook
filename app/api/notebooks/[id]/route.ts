import { NextRequest, NextResponse } from "next/server";
import { memoryStorage } from "@/lib/memory-storage";

// 获取单本笔记本详情 + 关联笔记
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 从内存中查找笔记本
    const notebook = memoryStorage.notebooks.get(params.id);

    if (!notebook) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    // 查找关联的笔记
    const notebookNotes = memoryStorage.notes.get(undefined, params.id)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    // 构造返回数据
    const responseNotebook = {
      ...notebook,
      notes: notebookNotes,
      _count: { notes: notebookNotes.length }
    };

    return NextResponse.json(responseNotebook);
  } catch (error) {
    console.error("获取笔记本失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 更新笔记本
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // 查找要更新的笔记本
    const existingNotebook = memoryStorage.notebooks.get(params.id);
    if (!existingNotebook) {
      return NextResponse.json({ error: "笔记本不存在" }, { status: 404 });
    }

    // 更新笔记本
    const updatedNotebook = {
      ...existingNotebook,
      title: body.title,
      description: body.description,
      updatedAt: new Date().toISOString(),
    };

    // 保存更新
    const result = memoryStorage.notebooks.update(params.id, updatedNotebook);
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
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 删除笔记本
    const success = memoryStorage.notebooks.delete(params.id);
    if (!success) {
      return NextResponse.json({ error: "笔记本不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除笔记本失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}