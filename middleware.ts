import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// 受保护的路径
const protectedPaths = ["/bookshelf", "/notebook", "/note", "/settings", "/tags", "/trash"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    // 获取 token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // 如果没有 token，重定向到登录页面
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 检查用户是否已验证邮箱（如果需要）
    // if (!token.emailVerified) {
    //   const verifyUrl = new URL("/verify-email", request.url);
    //   verifyUrl.searchParams.set("callbackUrl", request.url);
    //   return NextResponse.redirect(verifyUrl);
    // }
  }

  // 继续处理请求
  return NextResponse.next();
}

// 配置匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了:
     * 1. _next/static (静态文件)
     * 2. _next/image (图片优化文件)
     * 3. favicon.ico (favicon 文件)
     * 4. 公共 API 路由
     * 5. 登录页面
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
};