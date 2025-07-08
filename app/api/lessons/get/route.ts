import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");
  const lessonTitle = searchParams.get("lessonTitle");

  if (!courseId || !lessonTitle) {
    return Response.json({ error: "courseId and lessonTitle are required" }, { status: 400 });
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: {
        courseId_lessonTitle: {
          courseId,
          lessonTitle: decodeURIComponent(lessonTitle),
        },
      },
    });

    if (!lesson) {
      return Response.json({ message: "Lesson not found" }, { status: 404 });
    }

    return Response.json(lesson);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}