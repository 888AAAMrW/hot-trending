/** 归一化后的单条热搜 */
export interface HotItem {
  rank: number;
  title: string;
  url: string;
  hotScore: string | null;
}

/** 单个平台的热搜数据 */
export interface PlatformData {
  platform: "weibo" | "zhihu" | "bilibili";
  name: string;
  color: string;
  items: HotItem[];
  error?: string;
}

/** API 统一返回格式 */
export interface TrendsResponse {
  updatedAt: number;
  platforms: Record<string, PlatformData>;
}
