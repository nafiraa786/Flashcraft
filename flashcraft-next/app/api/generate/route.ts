import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { generateCode } from "@/lib/anthropic";
import { parseCodeOutput, validateFiles, getDefaultTemplate } from "@/lib/code-parser";
import { prisma } from "@/lib/db";
import type { CodeGenerationRequest, CodeGenerationResponse } from "@/types";

export const maxDuration = 60; // 60 second timeout for code generation

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
    const body: CodeGenerationRequest = await request.json();
    const { prompt, model = "claude-3-5-sonnet-20241022" } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Get session ID from query params or create new session
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const session = await prisma.studioSession.findFirst({
      where: { id: sessionId, userId: user.id },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update session status
    await prisma.studioSession.update({
      where: { id: sessionId },
      data: { status: "generating" },
    });

    try {
      // Call Claude to generate code
      const output = await generateCode(prompt.trim(), model);

      // Parse the output
      let files;
      try {
        files = parseCodeOutput(output);
      } catch (parseError) {
        console.error("Parse error, using default template:", parseError);
        files = getDefaultTemplate();
      }

      // Validate files
      const validation = validateFiles(files);
      if (!validation.valid) {
        console.warn("Validation warnings:", validation.errors);
        // Don't fail on validation warnings, proceed with best effort
      }

      // Store generated code in database
      const generatedCode = await prisma.generatedCode.create({
        data: {
          sessionId,
          userId: user.id,
          files: files,
          buildStatus: "success",
          generationPrompt: prompt.trim(),
          model,
        },
      });

      // Return response
      const response: CodeGenerationResponse = {
        id: generatedCode.id,
        sessionId,
        files,
        status: "ready",
      };

      return NextResponse.json(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Update session with error
      await prisma.studioSession.update({
        where: { id: sessionId },
        data: {
          status: "error",
          errorMessage,
        },
      });

      console.error("Code generation error:", error);

      return NextResponse.json(
        { error: `Failed to generate code: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Generate endpoint error:", error);
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

    // Get generated code
    const generatedCode = await prisma.generatedCode.findFirst({
      where: { sessionId, userId: user.id },
    });

    if (!generatedCode) {
      return NextResponse.json(
        { error: "Generated code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(generatedCode);
  } catch (error) {
    console.error("Error fetching generated code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
