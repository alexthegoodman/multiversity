export const getLesson = async (courseId: string, lessonTitle: string) => {
  const response = await fetch(
    `/api/lessons/get?courseId=${courseId}&lessonTitle=${encodeURIComponent(
      lessonTitle
    )}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // if (!response.ok) {
  //   throw new Error(`Failed to fetch lesson: ${response.statusText}`);
  // }

  return await response.json();
};

export const patchLesson = async (
  courseId: string,
  lessonTitle: string,
  sections?: any,
  content?: any
) => {
  const response = await fetch(`/api/lessons/patch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      courseId,
      lessonTitle,
      sections,
      content,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update lesson: ${response.statusText}`);
  }

  return await response.json();
};
