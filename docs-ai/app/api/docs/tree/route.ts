import { NextResponse } from "next/server";
import { getDocsTree } from "../../../../lib/github";

export async function GET() {
  try {
    const files = await getDocsTree();
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось загрузить документацию" },
      { status: 500 }
    );
  }
}
