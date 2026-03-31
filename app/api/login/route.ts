import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 不管传什么邮箱/验证码，都直接返回登录成功
  return NextResponse.json({
    success: true,
    token: 'mock-token-123',
    user: { id: 1, name: '测试用户' }
  });
}
