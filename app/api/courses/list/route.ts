import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        prompt: true,
        learningPlan: true,
        createdAt: true,
      },
    });

    return Response.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}