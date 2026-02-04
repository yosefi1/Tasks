import { NextRequest } from "next/server";
import { getSources } from "@/app/actions/sources";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as "private" | "work" | null;
  const type = searchParams.get("type") as "site" | "video" | null;
  const search = searchParams.get("search") ?? undefined;

  const sources = await getSources({
    category: category ?? undefined,
    type: type ?? undefined,
    search,
  });
  return Response.json(sources);
}
