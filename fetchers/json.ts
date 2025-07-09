import { learningPlanPrompt, lessonSectionsPrompt, lessonContentPrompt, sectionContentPrompt } from "@/prompts/json";

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

export const getLessonSections = async (
  allLessons: string[],
  lesson: string
) => {
  const response = await fetch(`/api/ai/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: lessonSectionsPrompt(allLessons, lesson),
    }),
  });

  return await response.json();
};

export const getLessonContent = async (lessonTitle: string, sections: string[]) => {
  const response = await fetch(`/api/ai/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: lessonContentPrompt(lessonTitle, sections),
    }),
  });

  return await response.json();
};

export const getSectionContent = async (lessonTitle: string, sectionTitle: string, courseId?: string) => {
  // Try to get cached content first if we have courseId
  if (courseId) {
    try {
      const { getLesson } = await import("@/fetchers/lesson");
      const { getSection, patchSection } = await import("@/fetchers/section");
      
      // Get lesson to find lessonId
      const lesson = await getLesson(courseId, lessonTitle);
      
      if (lesson && lesson.id) {
        // Try to get cached section content
        const cachedSection = await getSection(lesson.id, sectionTitle);
        
        if (cachedSection && cachedSection.content) {
          return cachedSection.content;
        }
        
        // Generate content if not cached
        const response = await fetch(`/api/ai/json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: sectionContentPrompt(lessonTitle, sectionTitle),
          }),
        });
        
        const content = await response.json();
        
        // Cache the generated content
        await patchSection(lesson.id, sectionTitle, content);
        
        return content;
      }
    } catch (error) {
      console.error("Error with section caching:", error);
      // Fall back to direct generation
    }
  }
  
  // Fallback to direct generation without caching
  const response = await fetch(`/api/ai/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: sectionContentPrompt(lessonTitle, sectionTitle),
    }),
  });

  return await response.json();
};
