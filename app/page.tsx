"use client";

import TextareaAutosize from "react-textarea-autosize";

import shared from "./shared.module.scss";
import styles from "./page.module.scss";
import { useState } from "react";
import { getLearningPlan, getLessonSections, getLessonContent } from "@/fetchers/json";
import { v4 as uuidv4 } from "uuid";
import { getCourse, patchCourse } from "@/fetchers/course";
import { getLesson, patchLesson } from "@/fetchers/lesson";

const examplePrompts = [
  "FFmpeg C++ Development",
  "Isomorphic JavaScript",
  "Introduction to Circuits",
  "Advanced Data Structures",
  "Assembly Code",
  "Embedded Rust Programming",
  "Autodesk's Fusion 360",
  "Apple 1",
];

const LessonItem = ({
  prompt,
  learningPlan,
  lesson,
  courseId,
}: {
  prompt: string;
  learningPlan: any;
  lesson: any;
  courseId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [lessonSections, setLessonSections] = useState<any>([]);
  const [lessonContent, setLessonContent] = useState<any>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const handleLessonOpen = async () => {
    if (!open) {
      setOpen(true);

      try {
        // First try to get cached lesson data
        const cachedLesson = await getLesson(courseId, lesson.lesson);
        
        if (cachedLesson && cachedLesson.sections) {
          setLessonSections(cachedLesson.sections.sections || cachedLesson.sections);
          if (cachedLesson.content) {
            setLessonContent(cachedLesson.content);
          }
        } else {
          // Generate sections if not cached
          const sections = await getLessonSections(learningPlan.lessons, lesson);
          setLessonSections(sections.sections);

          // Cache the sections
          await patchLesson(courseId, lesson.lesson, sections);

          // Update the course learning plan
          const fullPlan = {
            ...learningPlan,
            lessons: learningPlan.lessons.map((les: any) => {
              if (les.id === lesson.id) {
                return {
                  ...les,
                  ...sections,
                };
              } else {
                return les;
              }
            }),
          };

          await patchCourse(prompt, fullPlan);
        }
      } catch (error) {
        console.error("Error loading lesson:", error);
      }
    }
  };

  const handleGenerateContent = async () => {
    if (lessonSections.length === 0) return;
    
    setIsLoadingContent(true);
    
    try {
      const content = await getLessonContent(lesson.lesson, lessonSections);
      setLessonContent(content);
      
      // Cache the content
      await patchLesson(courseId, lesson.lesson, { sections: lessonSections }, content);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsLoadingContent(false);
    }
  };

  return (
    <>
      <li onClick={handleLessonOpen} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
        {lesson.lesson}
      </li>
      {open && (
        <div style={{ marginLeft: '20px', marginTop: '10px' }}>
          <h4>Sections:</h4>
          <ul>
            {lessonSections?.map((section: string, i: number) => (
              <li key={`section${i}`}>{section}</li>
            ))}
          </ul>
          
          {lessonSections.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              {!lessonContent ? (
                <button 
                  onClick={handleGenerateContent}
                  disabled={isLoadingContent}
                  className={shared.smallBtn}
                >
                  {isLoadingContent ? "Generating Content..." : "Generate Lesson Content"}
                </button>
              ) : (
                <div>
                  <h4>Lesson Content:</h4>
                  <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                    {lessonContent.sections?.map((section: any, i: number) => (
                      <div key={`content${i}`} style={{ marginBottom: '20px' }}>
                        <h5>{section.title}</h5>
                        <p>{section.content}</p>
                        
                        {section.keyPoints && section.keyPoints.length > 0 && (
                          <div>
                            <strong>Key Points:</strong>
                            <ul>
                              {section.keyPoints.map((point: string, j: number) => (
                                <li key={`point${j}`}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {section.examples && section.examples.length > 0 && (
                          <div>
                            <strong>Examples:</strong>
                            <ul>
                              {section.examples.map((example: string, j: number) => (
                                <li key={`example${j}`}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {section.exercises && section.exercises.length > 0 && (
                          <div>
                            <strong>Practice Exercises:</strong>
                            <ul>
                              {section.exercises.map((exercise: string, j: number) => (
                                <li key={`exercise${j}`}>{exercise}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState(0);
  const [learningPlan, setLearningPlan] = useState<any>(null);
  const [courseId, setCourseId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStartLearning = async () => {
    setIsLoading(true);

    // check if learning plan exists
    const course = await getCourse(prompt);

    console.info("course retrieved", course);

    if (course?.id) {
      setLearningPlan(course.learningPlan);
      setCourseId(course.id);
      setStep(1);
      setIsLoading(false);
    } else {
      // get new plan if not
      const plan = await getLearningPlan(prompt);

      const fullPlan = {
        ...plan,
        lessons: plan.lessons.map((lesson: string) => {
          return {
            lesson,
            id: uuidv4(),
          };
        }),
      };

      setLearningPlan(fullPlan);
      setStep(1);
      setIsLoading(false);

      const savedCourse = await patchCourse(prompt, fullPlan);
      setCourseId(savedCourse.id);

      console.info("course patched");
    }
  };

  const handleGetStarted = () => {
    setStep(2);
  };

  return (
    <>
      {isLoading && <div className={shared.loading}>Loading...</div>}
      {step === 0 && (
        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroInner}>
              <span>Multiversity</span>
              <h1>Learn anything you can imagine, affordably</h1>
              <h5>Self-Teaching at its finest</h5>
              <p>
                Enter the name of a course you want to take, or try one of the
                courses shown below.
              </p>
              <div className={styles.glowWrap}>
                <TextareaAutosize
                  minRows={4}
                  placeholder="What do you want to learn about?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <button
                className={shared.btn}
                onClick={handleStartLearning}
                disabled={isLoading}
              >
                Start Learning
              </button>
              <div className={styles.examplePrompts}>
                <p>
                  Many of these courses are hard to find or expensive elsewhere
                </p>
                <ul>
                  {examplePrompts.map((prompt) => (
                    <li key={prompt}>
                      <button
                        className={shared.smallBtn}
                        onClick={() => setPrompt(prompt)}
                      >
                        {prompt}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </main>
      )}
      {step === 1 && (
        <main className={styles.main}>
          <h1>Learning Plan</h1>
          <pre>{prompt}</pre>
          <p>Here is the learning plan for the course you requested:</p>
          <p>{learningPlan?.title}</p>
          <ul className={styles.learningPlan}>
            {learningPlan.lessons.map((lesson: string, i: number) => (
              <LessonItem
                key={`lesson${i}`}
                prompt={prompt}
                learningPlan={learningPlan}
                lesson={lesson}
                courseId={courseId}
              />
            ))}
          </ul>
          <h2>
            Look good? Get started by selecting a lesson, then diving into a
            section.
          </h2>
          {/* <button className={shared.btn} onClick={handleGetStarted}>
            Perfect! Get Started
          </button> */}
          <button className={shared.btn} onClick={handleStartLearning}>
            No thanks. Regenerate!
          </button>
        </main>
      )}
    </>
  );
}
