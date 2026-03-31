import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#888888"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createTagSchema.parse(body);

    // Check if tag already exists for this user
    const existing = await prisma.tag.findFirst({
      where: {
        name: validatedData.name,
        userId: session.user.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "标签已存在" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
        userId: session.user.id,
      },
    });

    return NextResponse.json(tag, { status: 201 });
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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const tags = await prisma.tag.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        usageCount: "desc",
      },
      include: {
        _count: {
          select: {
            notes: true,
          },
        },
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "缺少ID" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.tag.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    // Check name uniqueness if updating name
    if (updateData.name && updateData.name !== existing.name) {
      const duplicate = await prisma.tag.findFirst({
        where: {
          name: updateData.name,
          userId: session.user.id,
          id: { not: id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "标签名称已存在" },
          { status: 400 }
        );
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("更新标签失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少ID" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.tag.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除标签失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
