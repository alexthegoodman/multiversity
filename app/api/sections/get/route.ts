import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const lessonId = searchParams.get("lessonId");
  const sectionTitle = searchParams.get("sectionTitle");

  if (!lessonId || !sectionTitle) {
    return Response.json({ error: "lessonId and sectionTitle are required" }, { status: 400 });
  }

  try {
    const section = await prisma.section.findUnique({
      where: {
        lessonId_sectionTitle: {
          lessonId,
          sectionTitle: decodeURIComponent(sectionTitle),
        },
      },
    });

    if (!section) {
      return Response.json({ message: "Section not found" }, { status: 404 });
    }

    return Response.json(section);
  } catch (error) {
    console.error("Error fetching section:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}