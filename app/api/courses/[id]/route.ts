import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return Response.json({ error: "Course ID is required" }, { status: 400 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        lessons: true,
      },
    });

    if (!course) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    return Response.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}