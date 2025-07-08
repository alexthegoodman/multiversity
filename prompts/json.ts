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

export const lessonContentPrompt = (lessonTitle: string, sections: string[]) => `
Please create comprehensive, educational content for the following lesson and its sections. The content should be detailed, engaging, and suitable for self-paced learning.

Lesson: ${lessonTitle}

Sections:
${sections.map((section, index) => `${index + 1}. ${section}`).join('\n')}

For each section, provide:
1. A clear introduction to the topic
2. Key concepts and definitions
3. Practical examples or code snippets (if applicable)
4. Important points to remember
5. Practice exercises or questions

Format the response as a JSON object with the following structure:
{
  "title": "${lessonTitle}",
  "sections": [
    {
      "title": "Section 1 Title",
      "content": "Detailed content for section 1...",
      "keyPoints": ["Key point 1", "Key point 2"],
      "examples": ["Example 1", "Example 2"],
      "exercises": ["Exercise 1", "Exercise 2"]
    }
  ]
}
`;
