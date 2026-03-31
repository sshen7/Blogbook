import { NextRequest, NextResponse } from "next/server";

async function GET(req: NextRequest) {
  try {
    // 暂时返回模拟数据
    const deletedNotes = [];
    return NextResponse.json(deletedNotes);
  } catch (error) {
    console.error("获取回收站失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 暂时返回模拟数据
    const note = {
      id: "1",
      title: "恢复的笔记",
      content: "<p>这是一条恢复的笔记内容</p>",
      contentPlain: "这是一条恢复的笔记内容",
      wordCount: 10,
      userId: "1",
      isDraft: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(note);
  } catch (error) {
    console.error("恢复笔记失败:", error);
    return NextResponse.json({ error: "恢复失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 暂时返回成功响应
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除回收站笔记失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

export { GET };
