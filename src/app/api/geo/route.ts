import { headers } from "next/headers";

export async function GET() {
  const h = await headers();
  const country = h.get("x-vercel-ip-country") || "";
  const region = h.get("x-vercel-ip-country-region") || "";

  const map: Record<string, string> = {
    CN: "中国", US: "美国", JP: "日本", KR: "韩国", GB: "英国",
    FR: "法国", DE: "德国", CA: "加拿大", AU: "澳大利亚", SG: "新加坡",
    MY: "马来西亚", TH: "泰国", TW: "台湾", HK: "香港", MO: "澳门",
  };

  const countryName = map[country] || country;
  const location = [countryName, region].filter(Boolean).join(" ") || "地球某处";

  return Response.json({ location, code: country });
}
