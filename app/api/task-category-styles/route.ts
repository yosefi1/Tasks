import { getTaskCategoryStyles } from "@/app/actions/task-category-styles";

export async function GET() {
  const rows = await getTaskCategoryStyles();
  return Response.json(rows);
}
