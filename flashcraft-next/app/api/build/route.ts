import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mountFilesAndStartServer, destroyWebContainer } from "@/lib/webcontainer-server";

export const maxDuration = 120; // 2 minute timeout

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

    // Parse request
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Get session and verify ownership
    const session = await prisma.studioSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: { generatedCode: true },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 }
      );
    }

    if (!session.generatedCode) {
      return NextResponse.json(
        { error: "No generated code found. Generate code first." },
        { status: 400 }
      );
    }

    // Clean up old container if exists
    await destroyWebContainer(sessionId);

    // Update session status
    await prisma.studioSession.update({
      where: { id: sessionId },
      data: { status: "running" },
    });

    try {
      // Start WebContainer with generated files
      const files = session.generatedCode.files as any[];
      const { url, port } = await mountFilesAndStartServer(sessionId, files, (log) => {
        console.log(`[${sessionId}] ${log}`);
      });

      // Update session with preview URL
      await prisma.studioSession.update({
        where: { id: sessionId },
        data: {
          status: "complete",
          previewUrl: url,
          port,
        },
      });

      return NextResponse.json({
        success: true,
        previewUrl: url,
        port,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Update session with error
      await prisma.studioSession.update({
        where: { id: sessionId },
        data: {
          status: "error",
          errorMessage: `Build failed: ${errorMessage}`,
        },
      });

      console.error(`Build failed for session ${sessionId}:`, error);

      return NextResponse.json(
        { error: `Failed to build: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Build endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Get session
    const session = await prisma.studioSession.findFirst({
      where: { id: sessionId, userId: user.id },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: session.status,
      previewUrl: session.previewUrl,
      errorMessage: session.errorMessage,
    });
  } catch (error) {
    console.error("Error fetching build status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
