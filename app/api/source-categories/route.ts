import { getSourceCategories } from "@/app/actions/source-categories";

export async function GET() {
  const categories = await getSourceCategories();
  return Response.json(categories);
}
