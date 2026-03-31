"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到登录页面
    router.push('/login');
  }, [router]);

  return null;
}
