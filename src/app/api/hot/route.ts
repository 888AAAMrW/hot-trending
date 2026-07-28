import { fetchAllPlatforms } from "@/lib/fetcher";

export async function GET() {
  const data = await fetchAllPlatforms();

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
