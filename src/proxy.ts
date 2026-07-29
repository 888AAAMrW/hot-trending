import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const host = req.headers.get("host") || "";

  // 热搜子域名 → 保持原样
  if (host.startsWith("hot.")) {
    return NextResponse.next();
  }

  // 主域名 → 导航页
  if (host === "starrynova.cc" || host === "www.starrynova.cc") {
    const url = req.nextUrl.clone();
    if (url.pathname === "/") {
      url.pathname = "/nav";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
