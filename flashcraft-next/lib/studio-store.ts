import { prisma } from "@/lib/db";

export interface StudioSession {
  id: string;
  prompt: string;
  createdAt: string;
  userId?: string;
  status?: string;
  previewUrl?: string | null;
}

export async function createStudioSession(
  prompt: string,
  userId: string
): Promise<string> {
  const session = await prisma.studioSession.create({
    data: {
      prompt,
      userId,
      status: "idle",
    },
  });

  return session.id;
}

export async function getStudioSession(
  id: string
): Promise<StudioSession | null> {
  try {
    const session = await prisma.studioSession.findUnique({
      where: { id },
      include: {
        generatedCode: true,
        deployments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      prompt: session.prompt,
      createdAt: session.createdAt.toISOString(),
      userId: session.userId,
      status: session.status,
      previewUrl: session.previewUrl,
    };
  } catch (error) {
    console.error("Error fetching studio session:", error);
    return null;
  }
}

export async function updateStudioSessionStatus(
  id: string,
  status: string,
  data?: { previewUrl?: string; errorMessage?: string }
) {
  try {
    return await prisma.studioSession.update({
      where: { id },
      data: {
        status,
        previewUrl: data?.previewUrl,
        errorMessage: data?.errorMessage,
      },
    });
  } catch (error) {
    console.error("Error updating studio session:", error);
    throw error;
  }
}

export async function getUserSessions(userId: string) {
  try {
    return await prisma.studioSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        generatedCode: {
          select: { id: true, buildStatus: true },
        },
        deployments: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    return [];
  }
}

export async function deleteStudioSession(id: string) {
  try {
    return await prisma.studioSession.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting studio session:", error);
    throw error;
  }
}
