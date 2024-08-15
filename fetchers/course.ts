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
      // body: JSON.stringify({
      //   prompt,
      // }),
    }
  );

  return await response.json();
};
