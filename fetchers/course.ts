export const patchCourse = async (prompt: string, learningPlan: any) => {
  const response = await fetch(`/api/courses/patch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: encodeURIComponent(prompt),
      learningPlan,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update course: ${response.statusText}`);
  }

  return await response.json();
};

export const getCourse = async (prompt: string) => {
  const response = await fetch(
    `/api/courses/get?prompt=` + encodeURIComponent(prompt),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch course: ${response.statusText}`);
  }

  return await response.json();
};
