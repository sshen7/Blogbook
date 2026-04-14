import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createApiResponse, createApiError, withErrorHandler } from "@/lib/api-middleware";

const securitySettingsSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  autoLock: z.boolean().optional(),
  theme: z.string().optional(),
  fontSize: z.string().optional(),
  lineHeight: z.string().optional(),
});

// 更新安全设置
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("未授权");
  }

  const body = await req.json();
  const validatedData = securitySettingsSchema.partial().parse(body);

  const updates: any = {};

  // 更新密码
  if (validatedData.currentPassword && validatedData.newPassword) {
    // 验证当前密码
    // const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    // if (!user || !(await bcrypt.compare(validatedData.currentPassword, user.passwordHash))) {
    //   throw new Error("当前密码不正确");
    // }

    // 更新密码
    // updates.passwordHash = await bcrypt.hash(validatedData.newPassword, 10);
  }

  // 更新其他安全设置
  if (validatedData.autoLock !== undefined) {
    updates.autoLock = validatedData.autoLock;
  }

  // 更新用户偏好设置
  if (validatedData.theme) {
    updates.theme = validatedData.theme;
  }
  if (validatedData.fontSize) {
    updates.fontSize = validatedData.fontSize;
  }
  if (validatedData.lineHeight) {
    updates.lineHeight = validatedData.lineHeight;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("没有提供任何更新");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: updates,
  });

  return createApiResponse({ message: "安全设置已更新" });
});

// 获取安全设置
export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("未授权");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      autoLock: true,
      theme: true,
      fontSize: true,
      lineHeight: true,
    },
  });

  if (!user) {
    throw new Error("用户不存在");
  }

  return createApiResponse(user);
});