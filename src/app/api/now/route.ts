import { getNowStatus, setNowStatus } from "@/lib/now-store";

// GET — 获取公开状态
export async function GET() {
  const status = await getNowStatus();
  return Response.json(status);
}

// PATCH — 更新状态（站长专用）
export async function PATCH(request: Request) {
  const body = await request.json();
  const { doing, mode } = body;

  // 简单鉴权：Cookie + 请求头
  const cookie = request.headers.get("cookie") || "";
  const isOwner = cookie.includes("gb-owner=1");

  if (!isOwner) {
    return Response.json({ error: "只有站长能改哦" }, { status: 403 });
  }

  const updated = await setNowStatus({
    ...(doing !== undefined ? { doing: String(doing).slice(0, 50) } : {}),
    ...(mode !== undefined ? { mode: String(mode) } : {}),
  });

  return Response.json(updated);
}
