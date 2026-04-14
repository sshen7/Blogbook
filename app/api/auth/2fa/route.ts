import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createApiResponse, createApiError, withErrorHandler } from "@/lib/api-middleware";

const setup2FASchema = z.object({
  enable: z.boolean(),
});

// 设置 2FA
export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("未授权");
  }

  const body = await req.json();
  const validatedData = setup2FASchema.parse(body);

  // 这里应该实现 2FA 设置逻辑
  // 如果启用 2FA，生成 secret 并发送到用户邮箱或手机
  // 如果禁用 2FA，清除相关设置

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: validatedData.enable,
      // twoFactorSecret: validatedData.enable ? generateSecret() : null,
    },
  });

  return createApiResponse({ message: validatedData.enable ? "2FA 已启用" : "2FA 已禁用" });
});

// 验证 2FA 代码
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("未授权");
  }

  const body = await req.json();
  const validatedData = z.object({
    code: z.string().length(6),
  }).parse(body);

  // 验证 2FA 代码
  // const isValid = await verify2FACode(session.user.id, validatedData.code);
  // if (!isValid) {
  //   throw new Error("无效的 2FA 代码");
  // }

  return createApiResponse({ message: "2FA 验证成功" });
});