// 项目展示存储 — Vercel KV

import { kv } from "@vercel/kv";

const KV_KEY = "projects:list";

export interface Project {
  id: string;
  name: string;
  desc: string;
  href: string;
  icon: string;
  tags: string[];
}

const DEFAULTS: Project[] = [
  { id: "1", name: "Starry Nova", desc: "深空观测站主站 — 星闻、博客、导航三站一体", href: "https://starrynova.cc", icon: "🪐", tags: ["Next.js", "Vercel"] },
  { id: "2", name: "雷电将军桌宠", desc: "Electron 桌宠应用，慢养亲密度系统 + AI 对话", href: "#", icon: "⚡", tags: ["Electron", "DeepSeek"] },
  { id: "3", name: "VLM 校园场景", desc: "大创项目 · 视觉语言模型校园图文理解", href: "#", icon: "🔬", tags: ["Python", "VLM"] },
  { id: "4", name: "更多项目", desc: "新想法在路上，持续搭建中…", href: "#", icon: "🚧", tags: [] },
];

export async function getProjects(): Promise<Project[]> {
  try {
    const data = await kv.get<Project[]>(KV_KEY);
    return data && data.length > 0 ? data : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export async function addProject(p: Omit<Project, "id">): Promise<Project> {
  const projects = await getProjects();
  const id = String(Date.now());
  const project = { ...p, id };
  await kv.set(KV_KEY, [...projects, project]);
  return project;
}

export async function removeProject(id: string): Promise<void> {
  const projects = await getProjects();
  await kv.set(KV_KEY, projects.filter((p) => p.id !== id));
}
