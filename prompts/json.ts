export const learningPlanPrompt = (requestedCourse: string) => `
Please come up with a thorough learning plan for the requested course. The learning plan should include a title and a list of 3 to 12 lessons.
        
Requested Course: ${requestedCourse}

Provide the Learning Plan as a JSON object as shown below:
{
  "title": "Course Title",
  "lessons": ["Lesson Title 1", "Lesson Title 2", "Lesson Title 3"]
}
`;

export const lessonSectionsPrompt = (allLessons: any[], lesson: any) => `
The user has agreed to the following learning plan:

Learning Plan:
${allLessons.map((les) => {
  return `- ${les.lesson}\n`;
})}

Based on chosen lesson from the learning plan, please come up with 3 to 12 sections which give the learner a full understanding of the subject.

Chosen Lesson: ${lesson.lesson}

Provide the sections as a JSON object as shown below:
{
  "sections": ["Section 1", "Section 2", "Section 3"]
}
`;
