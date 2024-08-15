import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { prompt, learningPlan } = await req.json();

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
}
