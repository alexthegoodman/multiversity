import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { courseId, lessonTitle, sections, content } = await req.json();

    if (!courseId || !lessonTitle) {
      return Response.json({ error: "courseId and lessonTitle are required" }, { status: 400 });
    }

    const lesson = await prisma.lesson.upsert({
      where: {
        courseId_lessonTitle: {
          courseId,
          lessonTitle,
        },
      },
      update: {
        sections,
        content,
      },
      create: {
        courseId,
        lessonTitle,
        sections,
        content,
      },
    });

    return Response.json(lesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}