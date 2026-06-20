import { NextRequest, NextResponse } from "next/server";
import { createStudioSession } from "@/lib/studio-store";
import { getServerUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const id = await createStudioSession(prompt.trim(), user.id);
    return NextResponse.json({ id });
  } catch (error) {
    console.error("Failed to create studio session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

