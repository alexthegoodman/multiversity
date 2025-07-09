export const getSection = async (lessonId: string, sectionTitle: string) => {
  const response = await fetch(
    `/api/sections/get?lessonId=${lessonId}&sectionTitle=${encodeURIComponent(
      sectionTitle
    )}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return await response.json();
};

export const patchSection = async (
  lessonId: string,
  sectionTitle: string,
  content: any
) => {
  const response = await fetch(`/api/sections/patch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lessonId,
      sectionTitle,
      content,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update section: ${response.statusText}`);
  }

  return await response.json();
};