import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

export default function proxy(req: NextRequest) {
  // ── 基础限流：100 req / 60s / IP（极端滥用才触发）──
  const clientKey = getClientKey(req);
  const rate = checkRateLimit(clientKey, 100, 60_000);
  if (!rate.allowed) {
    return new NextResponse("请求过于频繁，请稍后再试", { status: 429 });
  }

  const host = req.headers.get("host") || "";
  let res: NextResponse;

  // 热搜子域名 → 保持原样
  if (host.startsWith("hot.")) {
    res = NextResponse.next();
  }
  // 主域名 → 导航页
  else if (host === "starrynova.cc" || host === "www.starrynova.cc") {
    const url = req.nextUrl.clone();
    if (url.pathname === "/") {
      url.pathname = "/nav";
      res = NextResponse.rewrite(url);
    } else {
      res = NextResponse.next();
    }
  } else {
    res = NextResponse.next();
  }

  // ── 安全响应头（所有响应统一加）──
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return res;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
