import { learningPlanPrompt, lessonSectionsPrompt } from "@/prompts/json";

export const getLearningPlan = async (requestedCourse: string) => {
  const response = await fetch(`/api/ai/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: learningPlanPrompt(requestedCourse),
    }),
  });

  return await response.json();
};

export const getLessonSections = async (lesson: string) => {
  const response = await fetch(`/api/ai/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: lessonSectionsPrompt(lesson),
    }),
  });

  return await response.json();
};
