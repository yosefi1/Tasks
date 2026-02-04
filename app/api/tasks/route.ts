import { NextRequest } from "next/server";
import { getTasks } from "@/app/actions/tasks";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const priority = searchParams.get("priority") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const orderBy = (searchParams.get("orderBy") as "date" | "custom") ?? "date";

    const tasks = await getTasks({ category, status, priority, search, orderBy });
    return Response.json(tasks);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[GET /api/tasks]", message, err);
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
