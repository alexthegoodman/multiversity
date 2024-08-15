import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let prompt = searchParams.get("prompt");

  if (!prompt) {
    return Response.error();
  }

  prompt = encodeURIComponent(prompt);

  console.info("get course", prompt);

  const course = await prisma.course.findUnique({
    where: {
      prompt,
    },
  });

  if (!course) {
    return Response.json({ message: "Course not found" });
  }

  return Response.json(course);
}
