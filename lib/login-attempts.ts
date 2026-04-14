import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// 使用 Redis 存储登录尝试
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60; // 30 minutes in seconds

// 记录登录尝试
export async function recordLoginAttempt(email: string) {
  const key = `login_attempts:${email}`;
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    // 设置过期时间
    await redis.expire(key, LOCKOUT_DURATION);
  }

  return attempts;
}

// 检查是否被锁定
export async function isLockedOut(email: string): Promise<boolean> {
  const attempts = await redis.get(`login_attempts:${email}`);
  return attempts && Number(attempts) >= MAX_ATTEMPTS;
}

// 重置登录尝试
export async function resetLoginAttempts(email: string) {
  await redis.del(`login_attempts:${email}`);
}

// 中间件：检查登录尝试限制
export async function withLoginAttemptLimit(req: NextRequest, res: NextResponse) {
  const { email } = await req.json();

  if (await isLockedOut(email)) {
    return NextResponse.json(
      { error: "账户已被锁定，请稍后再试" },
      { status: 429 }
    );
  }

  const attempts = await recordLoginAttempt(email);

  if (attempts >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "登录失败次数过多，账户已被锁定" },
      { status: 429 }
    );
  }

  return res;
}

// 在登录 API 中使用示例
/*
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password } = body;

  // 检查登录尝试限制
  const response = await withLoginAttemptLimit(req, new NextResponse());
  if (response) {
    return response;
  }

  // 继续处理登录逻辑
});
*/