import { NextRequest, NextResponse } from "next/server";
import { createStudioSession, ensureGuestUser } from "@/lib/studio-store";
import { getServerUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Attempt to get authenticated user; fall back to a guest user row so
    // the studio can be created without a Supabase session during development.
    let userId: string;
    try {
      const user = await getServerUser();
      userId = user?.id ?? await ensureGuestUser();
    } catch {
      userId = await ensureGuestUser();
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const id = await createStudioSession(prompt.trim(), userId);
    return NextResponse.json({ id });
  } catch (error) {
    console.error("Failed to create studio session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

