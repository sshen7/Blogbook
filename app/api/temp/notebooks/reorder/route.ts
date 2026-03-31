import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await req.json();
    const { items } = reorderSchema.parse(body);

    // Update all notebooks in a transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.notebook.updateMany({
          where: {
            id: item.id,
            userId: session.user.id,
          },
          data: {
            sortOrder: item.sortOrder,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      );
    }

    console.error("重新排序失败:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
