import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { prompt, learningPlan } = await req.json();

    if (!prompt || !learningPlan) {
      return Response.json({ error: "Prompt and learningPlan are required" }, { status: 400 });
    }

    const creatorAddress = req.headers.get("X-Forwarded-For");

    const course = await prisma.course.upsert({
      where: {
        prompt,
      },
      update: {
        learningPlan,
      },
      create: {
        prompt,
        learningPlan,
        creatorAddress: creatorAddress ? creatorAddress : "",
      },
    });

    return Response.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
