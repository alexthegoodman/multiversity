import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { lessonId, sectionTitle, content } = await req.json();

    if (!lessonId || !sectionTitle) {
      return Response.json({ error: "lessonId and sectionTitle are required" }, { status: 400 });
    }

    const section = await prisma.section.upsert({
      where: {
        lessonId_sectionTitle: {
          lessonId,
          sectionTitle,
        },
      },
      update: {
        content,
      },
      create: {
        lessonId,
        sectionTitle,
        content,
      },
    });

    return Response.json(section);
  } catch (error) {
    console.error("Error updating section:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}