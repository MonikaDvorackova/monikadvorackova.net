// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { getAllPostsMeta } from "@/lib/getAllPostsMeta";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await getAllPostsMeta();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error reading posts:", error);
    return NextResponse.json({ error: "Error reading posts" }, { status: 500 });
  }
}
