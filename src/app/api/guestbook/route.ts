import {
  getMessages, addMessage, deleteMessage,
  togglePin, toggleLike, addReply, getRandomMessage,
  checkDailyLimit, checkWriteRate,
} from "@/lib/guestbook-store";
import { getClientKey } from "@/lib/rate-limit";

// GET — 获取留言列表
export async function GET() {
  const messages = await getMessages();
  return Response.json({ messages });
}

// POST — 发留言（安全防护）
export async function POST(request: Request) {
  const clientKey = getClientKey(request);

  // 速率限制：10次/分钟
  if (!checkWriteRate(clientKey, 10)) {
    return Response.json({ error: "操作太频繁，请稍后再试" }, { status: 429 });
  }

  // 每日限制：游客5条，站长不限
  let body: { name?: string; text?: string; avatar?: string; isOwner?: boolean; honeypot?: string };
  try { body = await request.json(); } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }

  const isOwner = body.isOwner === true;

  // 蜜罐：隐藏字段被填写 = 机器人
  if (!isOwner && body.honeypot) {
    return Response.json({ error: "发送失败" }, { status: 400 });
  }

  if (!isOwner) {
    const limit = await checkDailyLimit(clientKey, 5);
    if (!limit.allowed) {
      return Response.json({ error: `今日留言次数已用完，明天再来吧`, remaining: 0 }, { status: 429 });
    }
  }

  const name = isOwner ? "站长" : String(body.name ?? "").trim().slice(0, 20);
  const avatar = isOwner ? undefined : (typeof body.avatar === "string" ? body.avatar : undefined);

  const result = await addMessage(name, body.text ?? "", isOwner, avatar);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ message: result.message }, { status: 201 });
}

// PATCH — 置顶/点赞/回复/删除
export async function PATCH(request: Request) {
  const clientKey = getClientKey(request);

  let body: { id?: number; action?: string; text?: string; isOwner?: boolean };
  try { body = await request.json(); } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }
  if (!body.id) return Response.json({ error: "缺少留言 ID" }, { status: 400 });

  switch (body.action) {
    case "like": {
      if (!checkWriteRate(clientKey, 30)) {
        return Response.json({ error: "操作太频繁" }, { status: 429 });
      }
      const { message, liked } = await toggleLike(body.id, clientKey);
      if (!message) return Response.json({ error: "留言不存在" }, { status: 404 });
      return Response.json({ message, liked });
    }
    case "pin":
    case "reply":
    case "delete": {
      if (!body.isOwner) return Response.json({ error: "无权操作" }, { status: 403 });
      if (body.action === "pin") {
        const msg = await togglePin(body.id);
        if (!msg) return Response.json({ error: "留言不存在" }, { status: 404 });
        return Response.json({ message: msg });
      }
      if (body.action === "reply") {
        if (!body.text) return Response.json({ error: "回复内容不能为空" }, { status: 400 });
        const msg = await addReply(body.id, body.text);
        if (!msg) return Response.json({ error: "留言不存在" }, { status: 404 });
        return Response.json({ message: msg });
      }
      if (body.action === "delete") {
        await deleteMessage(body.id);
        return Response.json({ ok: true });
      }
    }
    default:
      return Response.json({ error: "未知操作" }, { status: 400 });
  }
}

// PUT — 漂流瓶
export async function PUT() {
  const msg = await getRandomMessage();
  return Response.json({ message: msg });
}
