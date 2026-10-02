import { NextRequest, NextResponse } from "next/server";
import { getDocFile } from "../../../../lib/github";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Не указан путь к странице" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getDocFile(path));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось загрузить страницу" },
      { status: 500 }
    );
  }
}
