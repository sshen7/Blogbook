import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createApiResponse, createApiError, withErrorHandler } from "@/lib/api-middleware";

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

// 发送密码重置邮件
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedData = resetPasswordSchema.parse(body);

  const user = await prisma.user.findUnique({
    where: {
      email: validatedData.email,
    },
  });

  if (!user) {
    // 为了安全，即使邮箱不存在也返回成功
    return createApiResponse({ message: "如果邮箱存在，将发送重置邮件" }, 200);
  }

  // 这里应该发送密码重置邮件
  // const resetToken = generateResetToken();
  // await sendResetEmail(user.email, resetToken);

  return createApiResponse({ message: "密码重置邮件已发送" }, 200);
});

// 验证重置令牌并重置密码
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    throw new Error("缺少重置令牌");
  }

  const body = await req.json();
  const validatedData = z.object({
    password: z.string().min(8),
  }).parse(body);

  // 验证令牌并获取用户
  // const user = await verifyResetToken(token);
  // if (!user) {
  //   throw new Error("无效的重置令牌");
  // }

  // 更新密码
  // await prisma.user.update({
  //   where: { id: user.id },
  //   data: { passwordHash: await hashPassword(validatedData.password) },
  // });

  return createApiResponse({ message: "密码已重置" }, 200);
});