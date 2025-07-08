import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let prompt = searchParams.get("prompt");

  if (!prompt) {
    return Response.json({ error: "Prompt parameter is required" }, { status: 400 });
  }

  prompt = encodeURIComponent(prompt);

  console.info("get course", prompt);

  try {
    const course = await prisma.course.findUnique({
      where: {
        prompt,
      },
      include: {
        lessons: true,
      },
    });

    if (!course) {
      return Response.json({ message: "Course not found" }, { status: 404 });
    }

    return Response.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
