import { getProjects, addProject, removeProject } from "@/lib/project-store";

export async function GET() {
  const projects = await getProjects();
  return Response.json({ projects });
}

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  if (!cookie.includes("gb-owner=1")) {
    return Response.json({ error: "只有站长能添加项目" }, { status: 403 });
  }
  const body = await request.json();
  const { name, desc, href, icon, tags } = body;
  if (!name) return Response.json({ error: "项目名不能为空" }, { status: 400 });
  const project = await addProject({ name, desc: desc || "", href: href || "#", icon: icon || "📦", tags: tags || [] });
  return Response.json({ project });
}

export async function DELETE(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  if (!cookie.includes("gb-owner=1")) {
    return Response.json({ error: "只有站长能删除项目" }, { status: 403 });
  }
  const { id } = await request.json();
  if (!id) return Response.json({ error: "缺少项目 ID" }, { status: 400 });
  await removeProject(id);
  return Response.json({ ok: true });
}
